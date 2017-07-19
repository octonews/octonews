---
layout: default
---

### News

[submit](/submit.html)

{% for funk in site.data.news %}
{% assign post = funk[1] %}
* [{{ post.title }}]({{ post.url }})  
  by {{post.submittedBy}} on {{post.submittedAt | date_to_long_string}}
{% endfor %}
