---
layout: post
tags: [hack, dev]
tumblr_id: 10511737930

title: Don't have time doing the online BMW service survey? There is a script for you.
---

<p>I did a service for my bimmer. The service was great and few days later I get an email asking for a survey. It's a one page survey but I'm programmer (read "lazy") and I want to write some javascript code to learn javascript (I mentioned it's time to learn javascript <a href="http://hamxiaoz.tumblr.com/post/10266766635/whats-the-common-thing-between-c-and-javascript">here</a>), so here is the script:</p>&#13;
<pre><span>// ==UserScript==</span>&#13;
<span>// @name           BMW Service Survey All 10</span>&#13;
<span>// @namespace      hamxiaoz</span>&#13;
<span>// @author         hamxiaoz</span>&#13;
<span>// @copyright      2011, hamxiaoz (http://userscripts.org/users/355416)</span>&#13;
<span>// @licence        Summary: Free for personal non-commercial use</span>&#13;
<span>// @description    Automatically fill up survey with awesome (rate 10) feedback</span>&#13;
<span>// @version        2011.09.21</span>&#13;
<span>// @include        http://www.bmwcustomerexperience.com/survey*</span>&#13;
<span>// ==/UserScript==</span>&#13;
CheckRadioBox(<span>"rdb5"</span>);&#13;
SetSelectIndex(<span>"questionlist1_rptQuestionList_ctl05_ddlQuestionValues"</span>,<span>1</span>); <span>// select "Day I wanted"</span>&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl03_crblQuestionValuesBMW_10"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl06_crblQuestionValuesBMW_10"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl08_crblQuestionValuesBMW_10"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl17_crblQuestionValuesBMW_10"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl19_crblQuestionValuesBMW_10"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl21_crblQuestionValuesBMW_10"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl23_crblQuestionValuesBMW_0"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl25_crblQuestionValuesBMW_10"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl27_crblQuestionValuesBMW_0"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl30_crblQuestionValuesBMW_0"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl31_crblQuestionValuesBMW_10"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl32_crblQuestionValuesBMW_0"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl34_crblQuestionValues_0"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl36_crblQuestionValuesBMW_0"</span>);&#13;
CheckRadioBox(<span>"questionlist1_rptQuestionList_ctl38_crblQuestionValuesBMW_0"</span>);&#13;
alert(<span>"done, time to hit submit."</span>);&#13;
&#13;
<span>function</span> SetSelectIndex(selectId, index)&#13;
{&#13;
    <span>var</span> select = <span>document</span>.getElementById(selectId);&#13;
    <span>if</span>(select != <span>null</span> &amp;&amp; select.type == <span>"select-one"</span>)&#13;
        select.selectedIndex = index;&#13;
}&#13;
&#13;
<span>function</span> CheckRadioBox(rbId)&#13;
{&#13;
    <span>var</span> rb = <span>document</span>.getElementById(rbId);&#13;
    <span>if</span>(rb != <span>null</span> &amp;&amp; rb.type == <span>"radio"</span>)&#13;
        rb.checked = <span>true</span>;&#13;
}&#13;
</pre>&#13;
<p>The script is pretty simple and straightforward. It finds the highest score radio boxes and selects them.</p>&#13;
<p>The scripts has been tested under Chrome v14 and Firefox v6.02.</p>&#13;
<p>You can download and install the script from: </p>&#13;
<p><a title="http://userscripts.org/scripts/show/113658" href="http://userscripts.org/scripts/show/113658">http://userscripts.org/scripts/show/113658</a></p>&#13;
<p>UPDATE: I made a bookmarklet, you can drag this</p>&#13;
&#13;
<p><strong><a href="javascript:CheckRadioBox(&quot;rdb5&quot;);SetSelectIndex(&quot;questionlist1_rptQuestionList_ctl05_ddlQuestionValues&quot;,1); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl03_crblQuestionValuesBMW_10&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl06_crblQuestionValuesBMW_10&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl08_crblQuestionValuesBMW_10&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl17_crblQuestionValuesBMW_10&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl19_crblQuestionValuesBMW_10&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl21_crblQuestionValuesBMW_10&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl23_crblQuestionValuesBMW_0&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl25_crblQuestionValuesBMW_10&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl27_crblQuestionValuesBMW_0&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl30_crblQuestionValuesBMW_0&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl31_crblQuestionValuesBMW_10&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl32_crblQuestionValuesBMW_0&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl34_crblQuestionValues_0&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl36_crblQuestionValuesBMW_0&quot;); CheckRadioBox(&quot;questionlist1_rptQuestionList_ctl38_crblQuestionValuesBMW_0&quot;); alert(&quot;done, time to hit submit.&quot;); function SetSelectIndex(selectId, index) { var select = document.getElementById(selectId); if(select != null &amp;&amp; select.type == &quot;select-one&quot;) select.selectedIndex = index; } function CheckRadioBox(rbId) { var rb = document.getElementById(rbId); if(rb != null &amp;&amp; rb.type == &quot;radio&quot;) rb.checked = true; }">link</a> </strong></p>&#13;
&#13;
<p>to your toolbar to bookmark the link. When you open the survey page, just click the bookmark to use it.</p> 
