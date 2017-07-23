# scoop

> A collaborative link sharing platform

Find out about the motivation and ideas for the project in [ORIGIN.md](ORIGIN.md)

Scoop is a website rendered by [Jekyll](https://jekyllrb.com/) and is easy to publish to [GitHub Pages](https://pages.github.com/). People can share links through pull requests by adding files to the [_data/news](_data/news) folder. Instead of editing the [YAML](http://www.yaml.org/) files directly, Scoop has  a custom HTML form to submit links and is talking to the [GitHub API](https://developer.github.com/v3/) to create the pull-requests automagically without people even knowing about it. All it takes is logging in with their GitHub account, which is built into Scoop, too.

## The Scoop JavaScript API

All GitHub API calls are abstracted away in a higher-level API, which is implemented in [assets/scoop.js]. The `Scoop` object is accessible globally everywhere on the website.

### Account APIs

Examples

```js
if (Scoop.isSignedIn()) {
  // user is signed in
}

Scoop.set(key, value)
Scoop.get(key)
Scoop.unset(key)

Scoop.signIn() // redirects to GitHub to sign in
Scoop.signOut()

// fetch current user’s account information
Scoop.fetchAccount()

// fetch current user’s account information using single-use code & state
// query parameter from the GitHub OAuth redirect
Scoop.fetchAccount({code, state})
  .then(({token, scope, login, avatarUrl}) => {
    //
  })

// submit a link
Scoop.submitLink({url, tile})

// load pending link submissions
Scoop.getPendingLinks()
```
