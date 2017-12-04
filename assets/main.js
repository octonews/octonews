/* global $, Octonews */

const $submitForm = $('#submit-url')
const $accountTab = $('#account')
const $pendingTabNum = $('#pending span')
const $body = $('body')
const $pendingLinks = $('#pending-links')

$submitForm.on('submit', handleUrlSubmit)
$body.on('click', '[data-action="login"]', handleLoginClick)
$body.on('click', '[data-action="logout"]', handleLogoutClick)
$pendingLinks.on('click', '[data-action="accept"]', handleLinkAcceptClick)

if (Octonews.isSignedIn()) {
  renderSignedIn(Octonews.get('account'))
  renderPendingLinks()
} else {
  renderSignedOut()
}

handleOAuthRedirect()

if ($pendingLinks.length) {
  updatePendingLinks()
}

function handleUrlSubmit (event) {
  event.preventDefault()

  const url = $submitForm.find('[name=url]').val()
  const title = $submitForm.find('[name=title]').val()

  Octonews.submitLink({url, title})

  .then((response) => {
    window.alert('link submitted')
    $submitForm[0].reset()

    // let’s bump the number of pending links
    $pendingTabNum.text(+$pendingTabNum.text() + 1)
  })

  .catch((error) => {
    window.alert(error.toString())
  })
}

function handleLoginClick (event) {
  event.preventDefault()
  return Octonews.signIn()
}

function handleLogoutClick (event) {
  event.preventDefault()

  Octonews.signOut()

  .then(({login}) => {
    console.log(`${login} signed out`)
    renderSignedOut()
  })
}

function handleLinkAcceptClick (event) {
  event.preventDefault()

  const pullRequestNumber = $(event.target).closest('[data-nr]').data('nr')

  Octonews.acceptPendingLink(pullRequestNumber)

  .then(() => {
    return updatePendingLinks()
  })

  .then(() => {
    window.alert('Link accepted 🤗')
  })

  .catch((error) => {
    window.alert('Something went wrong 😭')
    console.log(error)
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

  Octonews.fetchAccount({
    code: code,
    state: responseState
  })

  .then((account) => {
    console.log(`${account.login} signed in`)
    renderSignedIn(account)
    return updatePendingLinks()
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
    <strong>${login}</strong>
    <a href="#logout" data-action="logout">(sign out)</a>`)
}

function renderSignedOut () {
  document.body.dataset.accountStatus = 'signed-out'
  delete document.body.dataset.hasWriteAccess
  $accountTab.html('<a href="#login" data-action="login">sign in</a>')
}

function renderPendingLinks () {
  const pending = Octonews.get('pendingLinks')

  if (!pending) return

  $pendingTabNum.text(pending.length)

  const listItemsHtml = pending.map((link) => {
    return `
      <li data-nr="${link.pullRequest.number}">
        <a href=${link.url}>${link.title}</a><br>
        by ${link.submittedBy} on ${link.submittedAt}<br>
        <br>
        <button data-action="accept">accept</button> <a href="${link.pullRequest.url}">comment on GitHub</a>
      </li>`
  }).join('')

  if (listItemsHtml) {
    $pendingLinks.html(`<ul>${listItemsHtml}</ul>`)
    return
  }

  $pendingLinks.html('<p>No pending links 👌</p>')
}

function updatePendingLinks () {
  return Octonews.getPendingLinks()

  .then((pending) => {
    Octonews.set('pendingLinks', pending)
    renderPendingLinks()
  })

  .catch((error) => {
    console.log(error)
  })
}
