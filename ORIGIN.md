# The origin of Octonews

## What

We want to create a link-sharing platform which allows communities to collaboratively share links on topics that interest them. Octonews will be a stand-alone website with a web UI that has the ability to submit links and, as an administrator, review submissions. It will also be able to integrate with GitHub to work well with existing workflows. 

While our main motivation is to to create it for the Hoodie community, making it flexible enough to be used by others is a priority from the start.


## Why

Sharing links around topics like Design, Tech Culture, Open Source, Documentation and Code is a long tradition at Hoodie. It is a vital part of our Hoodie Weekly. But the process of finding good resources to share is time consuming. And as the Hoodie Weekly requires work to be done on a weekly process, it’s a lot to ask from a single person. Nevertheless, we
had fantastic curators in the past who did an amazing job (thanks for all your hard work Lena, Jenn and Cecily).

Instead of searching for a new curator, we are looking for ways to make it simpler to collaborate on the editorial work. We take it as a given when working on code, and our code collaboration tools and workflows are arguably the reason why Open Source is so successful. So we figured - why not create better tooling for our editorial team, as well.

## How

The priority of the implementation of `octonews` is to be as accessible to contributors as possible. It is also an experiment using GitHub as a database of sorts, in order to keep track of people's contributions as well as to integrate existing tools we use today.

`octonews` will be a GitHub repository containing a [jekyll](https://jekyllrb.com) page. For the link submissions, we will use separate `.yml` files stored in the [`/_data/news`](https://jekyllrb.com/docs/datafiles/#the-data-folder) folder, and the files will be prefixed with the current date.

An example file could be `/_data/news/2016-10-14-obamas-facebook-messenger-bot-is-open-source.yml` with the following content

```yml
title: Obama’s Facebook Messenger bot is open source
url: https://obamawhitehouse.archives.gov/blog/2016/10/13/removing-barriers-constituent-conversations
submittedAt: 2016-10-14T07:01:28.072Z
submittedBy: gr2m
categories:
  - Code
  - Open Source
tags:
  - bots
  - white house
```

The links can be rendered with a loop like

```erb
{% for funk in site.data.news %}
{% assign post = funk[1] %}
* [{{ post.title }}]({{ post.url }})
{% endfor %}
```

Instead of using a text editor or the github.com UI to submit a new link, `octonews` will include a form which will utilise GitHub’s API to create a fork, the .yml file and the pull request. People submitting news will need to login with their GitHub account, but don’t need any experience in `.git`, `.github` or `.yml` files at all.

Once a PR gets submitted, the maintainers team can review and merge the PR, after which the page will be rebuilt automatically and the link will appear on the GitHub page.

Something we do _not_ plan to add is comments. People can have discussions on GitHub, but we will not show any discussions on news.github.com

## Further thoughts

The initial version described above should already help us to attract more editorial contributors as everyone who finds something interesting on the web can share it by submitting a single form.

Once that all works and proved useful, there are a few more thoughts for additional features we could add.

### Pending submissions

when signed in:

- show pending submissions in the web UI
- accept submissions through web UI
- edit submissions through web UI

### Reactions

- load ❤️ reactions added by contributors to the PRs and show them next to the submissions
- when signed in, allow to add reactions to the submitted PRs

### CI

Validate the submitted .yml file for:

- format
- list of categories
- valid link
- duplicates

### Tweets

- add field to form for a tweet (max 115 characters so that the URL can be added)
- tweet links in bulk (~3-5 at once, ideally from different categories) at specified time slots
- add `/_data/news/*.yml` files with `tweet` property containing URL of the tweet.

### automate members of "news" team

e.g.

- automatically invite people who submitted 3 links within 2 weeks
- members of news team can accept & edit submissions
- remove people from "news" team after they had been inactive for 3 months

### statistics

e.g.

- show statistics of submitted links by category and time
- show the most popular links of the past week / month
- avoid any kind of charts where people try to beat others. Statistics should show how we do as a community, not how individual contributors to compared to others, this is not a competition and we value everyone’s contribution

### chore work

- auto-block comments & reactions on PRs after e.g. 4 weeks

### help team creating link lists for Weekly & Newsletter

- allow people to bookmark links that for pre-selecation as they review new URls
- add "quotes" fields to the web form UI so people can add their favourite quotes of the linked resource.
