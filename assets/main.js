/* global $ */

const CLIENT_ID = 'fea7761d62c6ab170278'

const $submitForm = $('#submit-url')
const $accountContainer = $('#account')

handleOAuthRedirect()

$submitForm.on('submit', handleUrlSubmit)

renderLogin({
  login: window.localStorage.getItem('login'),
  avatarUrl: window.localStorage.getItem('avatar_url')
})

$accountContainer.on('click', 'a', handleAccountClick)

function handleUrlSubmit (event) {
  event.preventDefault()
}

function handleAccountClick (event) {
  event.preventDefault()

  const action = this.dataset.action

  if (action === 'login') {
    const state = Math.random().toString(36).substr(2)

    window.localStorage.setItem('auth_state', state)
    window.location.href = `http://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=public_repo&state=${state}`
    return
  }

  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('access_scope')
  window.localStorage.removeItem('login')
  window.localStorage.removeItem('avatar_url')
  renderLogin({})
}

function handleOAuthRedirect () {
  if (window.location.search) {
    const matches = window.location.search.match(/code=([^&]+)&state=([^&]+)/)
    if (matches) {
      const [, code, responseState] = matches

      if (responseState !== window.localStorage.getItem('auth_state')) {
        console.log('?state does not match value stored previously, aborting for XSS protection.')
      }

      window.localStorage.removeItem('auth_state')
      window.history.pushState({}, document.title, window.location.pathname)

      if (code) {
        $.getJSON(`https://github-login.glitch.me?code=${code}&state=${responseState}`)

        .then((response) => {
          // {
          //   access_token: 'ce9f8afc1718d57d24caf84a511e375e21e41eb6',
          //   token_type: 'bearer',
          //   scope: 'public_repo'
          // }

          window.localStorage.setItem('access_token', response.access_token)
          window.localStorage.setItem('access_scope', response.scope)

          return $.ajax({
            dataType: 'json',
            url: 'https://api.github.com/user',
            headers: {
              Authorization: `token ${response.access_token}`
            }
          })
        })

        .then((response) => {
          // https://developer.github.com/v3/users/#get-the-authenticated-user
          const login = response.login
          const avatarUrl = response.avatar_url

          window.localStorage.setItem('login', login)
          window.localStorage.setItem('avatar_url', avatarUrl)
          renderLogin({login, avatarUrl})
        })
      }
    }
  }
}

function renderLogin ({login, avatarUrl}) {
  if (login) {
    $accountContainer.html(`
      <img src="${avatarUrl}&size=50" alt="">
      <strong>${login}</strong>
      <a href="#logout" data-action="logout">(sign out)</a>`)
    return
  }

  $accountContainer.html('<a href="#login" data-action="login">sign in</a>')
}
