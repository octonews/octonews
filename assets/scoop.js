/* global $, localStorage */
window.Scoop = (function () {
  const LOGIN_SERVER_BASEURL = 'https://github-login.glitch.me'
  const GITHUB_API_BASEURL = 'https://api.github.com'
  const GITHUB_OAUTH_URL = 'http://github.com/login/oauth/authorize'
  const GITHUB_SCOPES = [
    'public_repo'
  ]

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

    return fetchAccountUsingToken
  }

  function fetchAccountUsingCodeAndState ({code, state}) {
    if (state !== get('oauthState')) {
      return Promise.reject(new Error('?state does not match value stored previously, aborting for XSS protection.'))
    }

    unset('oauthState')

    return $.getJSON(`${LOGIN_SERVER_BASEURL}${ENV_PREFIX}/${code}?state=${state}`)

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

    return $.ajax({
      dataType: 'json',
      url: `${GITHUB_API_BASEURL}/user`,
      headers: {
        Authorization: `token ${account.token}`
      }
    })

    .then((response) => {
      // https://developer.github.com/v3/users/#get-the-authenticated-user

      update('account', {
        login: response.login,
        avatarUrl: response.avatar_url
      })

      return get('account')
    })
  }

  function submitLink ({url, title}) {
    return Promise.reject(new Error('Not yet implemented'))
  }

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
