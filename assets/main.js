/* global $, Scoop */

const $submitForm = $('#submit-url')
const $accountTab = $('#account')
const $pendingTabNum = $('#pending span')
const $body = $('body')
const $pendingLinks = $('#pending-links')

$submitForm.on('submit', handleUrlSubmit)
$body.on('click', '[data-action="login"]', handleLoginClick)
$body.on('click', '[data-action="logout"]', handleLogoutClick)
$pendingLinks.on('click', '[data-action="accept"]', handleLinkAcceptClick)

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

    // let’s bump the number of pending links
    $pendingTabNum.text(+$pendingTabNum.text() + 1)
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

function handleLinkAcceptClick (event) {
  event.preventDefault()

  const pullRequestNumber = $(event.target).closest('[data-nr]').data('nr')

  Scoop.acceptPendingLink(pullRequestNumber)

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

  updatePendingLinks()
}

function renderSignedOut () {
  document.body.dataset.accountStatus = 'signed-out'
  delete document.body.dataset.hasWriteAccess
  $accountTab.html('<a href="#login" data-action="login">sign in</a>')
}

function updatePendingLinks () {
  return Scoop.getPendingLinks()

  .then((pending) => {
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
  })

  .catch((error) => {
    console.log(error)
  })
}
