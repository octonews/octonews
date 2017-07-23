/* global $, localStorage, btoa */
window.Scoop = (function () {
  const LOGIN_SERVER_BASEURL = 'https://github-login.glitch.me'
  const GITHUB_API_BASEURL = 'https://api.github.com'
  const GITHUB_OAUTH_URL = 'http://github.com/login/oauth/authorize'
  const GITHUB_SCOPES = [
    'repo' // once we make scoop public, change it to 'public_repo'
  ]
  const GITHUB_REPO = `gr2m/scoop`

  const CLIENT_ID = window.location.hostname === 'localhost' ? '12556b17f8b4fc3f3974' : 'fea7761d62c6ab170278'
  const ENV_PREFIX = window.location.hostname === 'localhost' ? '/local' : ''

  function get (key) {
    return JSON.parse(localStorage.getItem(key))
  }

  function update (key, changedProperties) {
    const item = get(key) || {}
    Object.assign(item, changedProperties)
    localStorage.setItem(key, JSON.stringify(item))
    return item
  }

  function unset (key) {
    localStorage.removeItem(key)
  }

  function isSignedIn () {
    return !!get('account')
  }

  function signOut () {
    const account = get('account')
    unset('account')
    return Promise.resolve(account)
  }

  function signIn () {
    const state = Math.random().toString(36).substr(2)

    window.localStorage.setItem('oauthState', JSON.stringify(state))
    window.location.href = `${GITHUB_OAUTH_URL}?client_id=${CLIENT_ID}&scope=${GITHUB_SCOPES.join(' ')}&state=${state}`
  }

  function fetchAccount ({code, state}) {
    if (state) {
      return fetchAccountUsingCodeAndState({code, state})
    }

    return fetchAccountUsingToken()
  }

  function submitLink ({url, title}) {
    const day = new Date().toISOString().substr(0, 10)
    const slug = title.toLowerCase().replace(/\W+/g, '-')
    const fileName = [day, slug].join('-')
    const branchName = `submit/${day}/${slug}`

    // 1. Get the sha for the latest commit on master
    //    https://developer.github.com/v3/git/refs/#get-a-reference
    return request(`${GITHUB_API_BASEURL}/repos/${GITHUB_REPO}/git/refs/heads/master`)

    // 2. Create a branch
    //    https://developer.github.com/v3/git/refs/#create-a-reference
    .then((result) => {
      const lastCommitSha = result.object.sha

      return request({
        type: 'POST',
        url: `${GITHUB_API_BASEURL}/repos/${GITHUB_REPO}/git/refs`,
        data: {
          ref: `refs/heads/${branchName}`,
          sha: lastCommitSha
        }
      })
    })

    // 3. Create the file on that branch
    //    https://developer.github.com/v3/repos/contents/#create-a-file
    .then((result) => {
      const path = `_data/news/${fileName}.yml`

      return request({
        type: 'PUT',
        url: `${GITHUB_API_BASEURL}/repos/${GITHUB_REPO}/contents/${path}`,
        data: {
          message: `📰 ${title}

Title: ${title}
Url: ${url}

Submitted with [🥄 Scoop](https://github.com/gr2m/scoop)!
`,
          // btoa creates a base-64 encoded string
          // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
          content: btoa(generateLinkFileContent({url, title})),
          branch: `${branchName}`
        }
      })
    })

    // 4. Create a pull request for the branch
    //    https://developer.github.com/v3/pulls/#create-a-pull-request
    .then((result) => {
      return request({
        type: 'POST',
        url: `${GITHUB_API_BASEURL}/repos/${GITHUB_REPO}/pulls`,
        data: {
          title: `📰 ${title}`,
          head: `${branchName}`,
          base: 'master',
          body: `Title: ${title}
Url: ${url}

Submitted with [🥄 Scoop](https://github.com/gr2m/scoop)!`,
          maintainer_can_modify: true
        }
      })
    })
  }

  // private methods - only used internally
  function request (options) {
    const account = get('account')

    if (typeof options === 'string') {
      options = {
        type: 'GET',
        url: options
      }
    }

    const ajaxOptions = {
      type: options.type,
      dataType: 'json',
      url: options.url
    }

    if (account) {
      ajaxOptions.headers = {
        Authorization: `token ${account.token}`
      }
    }

    if (options.data) {
      ajaxOptions.data = JSON.stringify(options.data)
    }

    return $.ajax(ajaxOptions)
  }

  function generateLinkFileContent ({title, url}) {
    const now = new Date().toISOString()
    const login = get('account').login

    return `title: ${title}
url: ${url}
submittedAt: ${now}
submittedBy: ${login}
`
  }

  function fetchAccountUsingCodeAndState ({code, state}) {
    if (state !== get('oauthState')) {
      return Promise.reject(new Error('?state does not match value stored previously, aborting for XSS protection.'))
    }

    unset('oauthState')

    return request(`${LOGIN_SERVER_BASEURL}${ENV_PREFIX}/${code}?state=${state}`)

    .then((response) => {
      // {
      //   access_token: 'ce9f8afc1718d57d24caf84a511e375e21e41eb6',
      //   token_type: 'bearer',
      //   scope: 'public_repo'
      // }

      update('account', {
        token: response.access_token,
        scope: response.scope
      })

      return fetchAccountUsingToken()
    })
  }

  function fetchAccountUsingToken () {
    const account = get('account')

    if (!account) {
      return Promise.reject(new Error('Not signed in'))
    }

    return request(`${GITHUB_API_BASEURL}/user`)

    .then((response) => {
      // https://developer.github.com/v3/users/#get-the-authenticated-user

      update('account', {
        login: response.login,
        avatarUrl: response.avatar_url
      })

      return get('account')
    })
  }

  // return API
  return {
    get,
    update,
    unset,
    isSignedIn,
    signIn,
    signOut,
    fetchAccount,
    submitLink
  }
})()
