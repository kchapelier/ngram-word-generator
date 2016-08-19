"use strict";

/*
Chinese characters

U+2E80 > U+2F00 : CJK Radicals Supplement
U+2F00 > U+2FD5 : Kangxi Radicals
u+3400 > U+4DBF : CJK Unified Ideographs Extension A
U+4E00 > U+9FFF : CJK Unified Ideographs
U+F900 > U+FAFF : CJK Compatibility Ideographs
*/
var chinese = /[^\u2E80-\u2FD5\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+/ig;

/*
Japanese characters (actually includes all the chinese characters instead of only the jōyō kanji)

U+2E80 > U+2F00 : CJK Radicals Supplement
U+2F00 > U+2FD5 : Kangxi Radicals
U+3040 > U+3096 : Hiragana
U+30A0 > U+30FF : Katakana
u+3400 > U+4DBF : CJK Unified Ideographs Extension A
U+4E00 > U+9FFF : CJK Unified Ideographs
U+F900 > U+FAFF : CJK Compatibility Ideographs
*/
var japanese = /[^\u3040-\u3096\u30A0-\u30FF\u2E80-\u2FD5\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+/ig;

/*
Symbols and punctuation filter

U+0000 > U+002F & U+003A > U+0040 & U+005B > U+0060 & U+007B > U+007F : Handpicked symbols and punctuation from Basic Latin
U+0080 > U+00BF & U+00F7 : Handpicked symbols and punctuation from Latin-1 Supplement
U+02B0 > U+02FF : Spacing Modifier Letters
U+2000 > U+27FF & U+2900 > U+2BFF : A whole set of symbols and punctuation (excluding the Braille Patterns block)
U+2E00 > U+2E7F : Supplemental Punctuation
U+3000 > U+303F : CJK Symbols and Punctuation
U+FE30 > U+FE4F : CJK Compatibility Forms
*/
var noSymbols = /[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F\u0080-\u00BF\u00F7\u02B0-\u02FF\u2000-\u27FF\u2900-\u2BFF\u2E00-\u2E7F\u3000-\u303F\uFE30-\uFE4F]+/ig;

module.exports = {
    none: /\s+/ig,
    french: /[^a-zéèëêúüûùœàáäâæíïìîóöôòç]+/ig,
    english: /[^a-zæœ]+/ig,
    oldEnglish: /[^a-zþðƿȝæœ]/ig,
    japanese: japanese,
    chinese: chinese,
    noSymbols: noSymbols,
    alphabetical: /[^a-z]+/ig,
    numerical: /[^0-9]+/ig,
    alphaNumerical: /[^0-9a-z]+/ig,
    extended: /[^a-zéèëêęėēúüûùūçàáäâæãåāíïìîįīóöôòõœøōñńß]+/ig,
    extendedNumerical: /[^0-9a-zéèëêęėēúüûùūçàáäâæãåāíïìîįīóöôòõœøōñńß]+/ig
};
