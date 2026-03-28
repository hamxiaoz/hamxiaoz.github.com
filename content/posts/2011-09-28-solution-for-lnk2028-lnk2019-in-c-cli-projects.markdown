---
layout: post
category: dev
tumblr_id: 10748033443

title: Solution for LNK2028 & LNK2019 in C++/CLI projects
---

<p>Short version:<br /><strong>link to your lib file.</strong></p>&#13;
<p><br />Long version:<br />A recent project I'm working on requires me to make a plugin for a native C++ application. So I need to create a dll that exposes C functions thru dllexport. As a .Net guy, I've my business model and UI written in .Net and a C++/CLI project serves as a glue project between .net and the native C++ application. The solution looks like this:</p>&#13;
<p><br />- plugin.dll (C++/CLI, used by native C++ application, depends on businesslogic.dll)<br />- businesslogic.dll (C++/CLI, contains a native C++ class that will get called by plugin.dll)<br />- ui.dll (C#, used by businesslogic.dll)</p>&#13;
<p><br />After coding everything, I find out that all dll compiles fine except pluging.dll: it complains about LINK2028 &amp; LNK2019. I know the linker error usually tells me that something is missing its definition. But I'm still scratching my head because A: I have the header file included and B: I have the dll added to the project reference. In .net the project should build fine. But it turns out that since businesslogic.dll is a mixed dll, to use with plugin.dll, I should also link to the businesslogic.lib file.<br /><br />It took me about 30 minutes to figure out that I need to link to the lib file of my own C++/CLI project. I know, I'm not that familiar with native programming. Anyway, if you google "LNK2028" you'll find a lot of questions asked, either with no answer or answers doesn't make sence. So I'd like to share this post with everyone, hopefully can save someone's time. (especially .net programmer)<br /><br />BTW: <a href="http://stackoverflow.com/questions/5683710/wstring-lpcwstr-in-shellexecute-give-me-error-lnk2028-lnk2019">here </a>is a similar error with the same solution.</p> 
