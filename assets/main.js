/* global $, Scoop */

const $submitForm = $('#submit-url')
const $accountTab = $('#account')
const $pendingTabNum = $('#pending span')
const $body = $('body')
const $pendingLinks = $('#pending-links')

$submitForm.on('submit', handleUrlSubmit)
$body.on('click', '[data-action="login"]', handleLoginClick)
$body.on('click', '[data-action="logout"]', handleLogoutClick)

if (Scoop.isSignedIn()) {
  renderSignedIn(Scoop.get('account'))
} else {
  renderSignedOut()
}

handleOAuthRedirect()

function handleUrlSubmit (event) {
  event.preventDefault()

  const url = $submitForm.find('[name=url]').val()
  const title = $submitForm.find('[name=title]').val()

  Scoop.submitLink({url, title})

  .then((response) => {
    window.alert('link submitted')
    $submitForm[0].reset()
  })

  .catch((error) => {
    window.alert(error.toString())
  })
}

function handleLoginClick (event) {
  event.preventDefault()
  return Scoop.signIn()
}

function handleLogoutClick (event) {
  event.preventDefault()

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

  renderAccountLoading()

  Scoop.fetchAccount({
    code: code,
    state: responseState
  })

  .then((account) => {
    console.log(`${account.login} signed in`)
    renderSignedIn(account)
  })

  .catch((error) => {
    console.log(error.stack)
  })
}

function renderAccountLoading () {
  $accountTab.html(`Loading…`)
  return
}

function renderSignedIn ({login, avatarUrl, hasWriteAccess}) {
  document.body.dataset.accountStatus = 'signed-in'
  if (hasWriteAccess) {
    document.body.dataset.hasWriteAccess = 'yes'
  }
  $accountTab.html(`
    <img src="${avatarUrl}&size=50" alt="">
    <strong>${login}</strong>
    <a href="#logout" data-action="logout">(sign out)</a>`)

  Scoop.getPendingLinks()

  .then((pending) => {
    $pendingTabNum.text(pending.length)

    if ($pendingLinks.length === 0) return

    const listItemsHtml = pending.map((link) => {
      return `<li>
        <a href=${link.url}>${link.title}</a><br>
        by ${link.submittedBy} on ${link.submittedAt}
      </li>`
    }).join('\n')

    $pendingLinks.html(`<ul>${listItemsHtml}</ul>`)
  })

  .catch((error) => {
    console.log(error)
  })
}

function renderSignedOut () {
  document.body.dataset.accountStatus = 'signed-out'
  delete document.body.dataset.hasWriteAccess
  $accountTab.html('<a href="#login" data-action="login">sign in</a>')
}
