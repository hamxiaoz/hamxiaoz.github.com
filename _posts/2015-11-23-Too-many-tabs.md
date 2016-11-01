---
layout: post
title: Too many tabs?
close_to_link: "/blog"
tags:
- chrome-extension
- tips
---

我是一个喜欢开着很多个tabs的用户. Tabs一多, 占用的内存就大, 相应的, 浏览器(我主要用Chrome)就会变得很慢. 但是我又不想把所有的tabs一下子都关掉, 这种情况下, 怎么办呢?

有两种解决方法:

1. 把所有的tabs都关闭
2. 把所有tabs都'杀'死

**1. 把所有的tabs都关闭**

是的, 都关闭, 但是关闭之前, 我们可以先把tabs保存下来.

我们可以利用一个叫做['OneTab'](https://chrome.google.com/webstore/detail/onetab/chphlpgkkbolifaimnlloiipkdnihall)的扩展.
![](https://s3-us-west-1.amazonaws.com/blog.zurassic.com/2016/Feb/onetab-1454796245647.png)

**使用方法**很简单, 点一下那个图标, 瞬间所有tabs都被关闭, "乖乖得"排这了一个页面.
![](https://s3-us-west-1.amazonaws.com/blog.zurassic.com/2016/Feb/onetab_list-1454796254319.png)
**要恢复某个tab**, 你可以点击链接打开.

**2. 把所有tabs都'杀'死**

这个原理比较有意思, 就是把每个tab的进程都杀掉. 鉴于Chrome的多进程设计, 杀掉那些进程, 并不会造成浏览器的崩溃. 于是, 这个[npm package: kill-tabs](https://github.com/sindresorhus/kill-tabs)就是利用了这样一个原理.

**使用方法**也简单:

```shell
$ kill-tabs 
```

**要恢复某个tab**的话, 直接reload即可.

---
#### 后记
其实, 开着很多个tabs而不关闭, 这就是一种**拖延症**.

如何治疗呢?  
答案很简单, 换一台很烂的电脑. 

理由是, 大部分时候, **拖延的真正原因是我们自以为还有东西可以挥霍**. 比如内存, 比如时间.  
而改变自己有点难, 所以先改变环境.

