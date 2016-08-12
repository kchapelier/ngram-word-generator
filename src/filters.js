"use strict";

module.exports = {
    none: /\s+/ig,
    alphabetical: /[^a-z]+/ig,
    numerical: /[^0-9]+/ig,
    alphaNumerical: /[^0-9a-z]+/ig,
    extended: /[^a-zéèëêęėēúüûùūçàáäâæãåāíïìîįīóöôòõœøōñńß]+/ig,
    extendedNumerical: /[^0-9a-zéèëêęėēúüûùūçàáäâæãåāíïìîįīóöôòõœøōñńß]+/ig
};
