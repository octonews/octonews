/* global $, Scoop */

const $submitForm = $('#submit-url')
const $accountContainer = $('#account')

$submitForm.on('submit', handleUrlSubmit)
$accountContainer.on('click', 'a', handleAccountClick)

if (Scoop.isSignedIn()) {
  renderSignedIn(Scoop.get('account'))
} else {
  renderSignedOut()
}

handleOAuthRedirect()

function handleUrlSubmit (event) {
  event.preventDefault()
}

function handleAccountClick (event) {
  event.preventDefault()

  const action = this.dataset.action

  if (action === 'login') {
    return Scoop.signIn()
  }

  Scoop.signOut()

  .then(({login}) => {
    console.log(`${login} signed out`)
    renderSignedOut()
  })
}

function handleOAuthRedirect () {
  // check if we got redirected from the GitHub login by checking for
  // ?code=...&state=...
  if (!window.location.search) {
    return
  }

  const matches = window.location.search.match(/code=([^&]+)&state=([^&]+)/)
  if (!matches) {
    return
  }
  const [, code, responseState] = matches
  window.history.pushState({}, document.title, window.location.pathname)

  if (!code || !responseState) {
    return
  }

  renderAccountLoading();

  Scoop.fetchAccount({
    code: code,
    state: responseState
  })

  .then(({login, avatarUrl}) => {
    console.log(`${login} signed in`)
    renderSignedIn({login, avatarUrl})
  })

  .catch((error) => {
    console.log(error.stack)
  })
}

function renderAccountLoading() {
  $accountContainer.html(`
    Loading…
    `)
  return
}

function renderSignedIn ({login, avatarUrl}) {
  document.body.dataset.accountStatus = 'signed-in'
  $accountContainer.html(`
    <img src="${avatarUrl}&size=50" alt="">
    <strong>${login}</strong>
    <a href="#logout" data-action="logout">(sign out)</a>`)
  return
}

function renderSignedOut () {
  document.body.dataset.accountStatus = 'signed-out'
  $accountContainer.html('<a href="#login" data-action="login">sign in</a>')
}
