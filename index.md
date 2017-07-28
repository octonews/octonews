---
layout: default
title: News
---

{% for funk in site.data.news reversed %}
{% assign post = funk[1] %}
* [{{ post.title }}]({{ post.url }})  
  by {{post.submittedBy}} on {{post.submittedAt | date_to_long_string}}
{% endfor %}
