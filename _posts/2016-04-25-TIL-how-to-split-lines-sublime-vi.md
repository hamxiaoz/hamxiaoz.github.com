---
layout: post
title:  "TIL: [Sublime+VI] How to split selections into lines?"
---

How do you remove the bullet points in this paragraph:

```
1. US Patent No. 4,136,359: "Microcomputer for use with video display"[41]—for which he was inducted into the National Inventors Hall of Fame.
2. US Patent No. 4,210,959: "Controller for magnetic disc, recorder, or the like"[42]
3. US Patent No. 4,217,604: "Apparatus for digitally controlling PAL color display"[43]
4. US Patent No. 4,278,972: "Digitally-controlled color signal generation means for use with display"[44]
```
 
To:

```
US Patent No. 4,136,359: "Microcomputer for use with video display"[41]—for which he was inducted into the National Inventors Hall of Fame.
US Patent No. 4,210,959: "Controller for magnetic disc, recorder, or the like"[42]
US Patent No. 4,217,604: "Apparatus for digitally controlling PAL color display"[43]
US Patent No. 4,278,972: "Digitally-controlled color signal generation means for use with display"[44]
```
 
I'm using sublime with vintage mode (vi).

Previously, I would just delete the first bullet points (`02dw`) then repeat (`.`) on the following lines. Or record a macro (`q`).

![](https://s3-us-west-1.amazonaws.com/blog.zurassic.com/20160425-repeat.gif)

The other day I learned split selections into lines in Sublime (from my coworker Danniel Condez), and now I can do this:

`V -> } -> SHIFT+CMD+L -> v02dw -> ESC`

![](https://s3-us-west-1.amazonaws.com/blog.zurassic.com/20160425-multiple%2Bline.gif)

You might wonder why is this better?

Because it can scale (still a constant time if you have 1000 lines compared to repeat 999 times).
