# octonews

> A collaborative link sharing platform

Find out about the motivation and ideas for the project in [ORIGIN.md](ORIGIN.md)

Octonews is a website rendered by [Jekyll](https://jekyllrb.com/) and is easy to publish to [GitHub Pages](https://pages.github.com/). People can share links through pull requests by adding files to the [_data/news](_data/news) folder. Instead of editing the [YAML](http://www.yaml.org/) files directly, Octonews has  a custom HTML form to submit links and is talking to the [GitHub API](https://developer.github.com/v3/) to create the pull-requests automagically without people even knowing about it. All it takes is logging in with their GitHub account, which is built into Octonews, too.

## The Octonews JavaScript API

All GitHub API calls are abstracted away in a higher-level API, which is implemented in [assets/octonews.js]. The `Octonews` object is accessible globally everywhere on the website.

### Account APIs

Examples

```js
if (Octonews.isSignedIn()) {
  // user is signed in
}

Octonews.set(key, value)
Octonews.get(key)
Octonews.unset(key)

Octonews.signIn() // redirects to GitHub to sign in
Octonews.signOut()

// fetch current user’s account information
Octonews.fetchAccount()

// fetch current user’s account information using single-use code & state
// query parameter from the GitHub OAuth redirect
Octonews.fetchAccount({code, state})
  .then(({token, scope, login, avatarUrl}) => {
    //
  })

// submit a link
Octonews.submitLink({url, tile})

// load pending link submissions
Octonews.getPendingLinks()
```

## License

[Apache 2.0](LICENSE)
