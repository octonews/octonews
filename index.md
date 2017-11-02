---
layout: default
title: News
---

<ul id="accepted-links">
{% for funk in site.data.news reversed %}
{% assign post = funk[1] %}
  <li id="pr-{{post.pr}}">
    <a href="{{ post.url }}">
      {{ post.title }}
    </a><br>
    by {{post.submittedBy}} on {{post.submittedAt | date_to_long_string}}<br>
    ❤️×<span class="reactions"></span>
  </li>
{% endfor %}
</ul>
