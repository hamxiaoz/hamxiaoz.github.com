---
page_title: Test
close_to_link: /
layout: post
date: 2016-10-26
---

THIS IS A TEST PAGE.

Picture:

![]({{site.url}}/assets/images/zhi.png)

``` javascript
function test() {
  console.log('hello');
}
```

<ul>
  {% for page in site.pages %}
    <li>
      <a href="{{ page.url | relative_url }}">({{page.title}}) {{ page.url | escape }}</a>
    </li>
  {% endfor %}
</ul>

Static files (http://jekyllrb.com/docs/variables/)
<ul>
  {% for file in site.static_files %}
    <li>
      <a href="{{ file.path }}">{{ file.path }}:  {{file.name}} ({{file.modified_time}}) </a>
    </li>
  {% endfor %}
</ul>

Data (books)
<ul>
{% for book in site.data.books %}
  <li>
    {{ book.name }} {{book.github}}
  </li>
{% endfor %}
</ul>

Posts:
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

You can find the source code for the Jekyll new theme at:
{% include icon-github.html username="jekyll" %} /
[minima](https://github.com/jekyll/minima)

You can find the source code for Jekyll at
{% include icon-github.html username="jekyll" %} /
[jekyll](https://github.com/jekyll/jekyll)
