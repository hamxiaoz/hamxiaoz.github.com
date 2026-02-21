---
layout: post
title: How to add Disqus comments to Ghost blog?
close_to_link: "/blog"
tags:
- english
- tutorial
---

There are several tutorials available online but none of them is updated (as 2015/11). 

Below is a updated version, based on the [this document on ghost](http://support.ghost.org/add-disqus-to-my-ghost-blog/):

1. Open the above document
2. Follow the instructions to sign up on Disqus
3. When pasting the universal code, note the code listed in that page is not updated to the latest one:
  - The one displayed on the ghost document is **deprecated**
  - The one displayed in the [Disqus document](https://help.disqus.com/customer/portal/articles/1454924-ghost-installation-instructions) is also **deprecated**

  Deprecated:
```js
<div id="disqus_thread"></div>
<script type="text/javascript">
    var disqus_shortname = 'example'; // required: replace example with your forum shortname
    var disqus_identifier = '{{id}}';
 
    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="http://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
<a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>
```

You should use **the following**:

```javascript
<div id="disqus_thread"></div>
<script>
/**
* RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
* LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables
*/
/*
var disqus_config = function () {
this.page.url = '{{url}}'; // Replace PAGE_URL with your page's canonical URL variable
this.page.identifier = 'ghost-{{id}}'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
};
*/
(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');

s.src = '//THIS-SHOULD-BE-YOUR-DISQUS-SHORTNAME.disqus.com/embed.js';

s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
```

Highlights:

- `this.page.url = '{{url}}';` We use the post.url as the url, see [post context](https://themes.ghost.org/docs/post-context)
- `this.page.identifier = 'ghost-{{id}}';` We use the post.id along with a prefix `ghost-`. This is to avoid conflicts as you might have other sites using Disqus and other page might have the same id.
- `s.src = '//THIS-SHOULD-BE-YOUR-DISQUS-SHORTNAME.disqus.com/embed.js'` Use your shortname here.


Happy writing, everyone.

