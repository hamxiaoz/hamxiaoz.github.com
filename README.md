## Dev
/test: test page

To run: `bundle exec jekyll serve`

## CSS (semantic-ui)
I customized the default css font to make it look pretty on Chinesee.
Here is the changes:

```css
// old
@headerFont        : @fontName, 'Helvetica Neue', Arial, Helvetica, sans-serif; 
@pageFont          : @fontName, 'Helvetica Neue', Arial, Helvetica, sans-serif;

// new 
@headerFont        : @fontName, 'Helvetica Neue',"Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif; 
@pageFont          : @fontName, 'Helvetica Neue', "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
```