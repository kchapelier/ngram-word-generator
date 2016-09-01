"use strict";

var filters = require('./filters'),
    uniq = require('uniq');

var doNgram = function doNgram (string, resultData, config) {
    var ngramCount = string.length - config.n + 1,
        ngram,
        previousNgram = null,
        ngramData,
        i;

    for (i = 0; i < ngramCount; i++) {
        ngram = string.substr(i, config.n);

        if (!resultData.elements[ngram]) {
            ngramData = resultData.elements[ngram] = {
                probabilityAsFirst: 0,
                children: {},
                lastChildren: {}
            };
        } else {
            ngramData = resultData.elements[ngram];
        }

        if (i === 0) {
            ngramData.probabilityAsFirst++;
        }

        if (previousNgram !== null) {
            if (i === ngramCount - 1) {
                if (!previousNgram.lastChildren[ngram]) {
                    previousNgram.lastChildren[ngram] = 1;
                } else {
                    previousNgram.lastChildren[ngram]++;
                }
            } else {
                if (!previousNgram.children[ngram]) {
                    previousNgram.children[ngram] = 1;
                } else {
                    previousNgram.children[ngram]++;
                }
            }
        }

        previousNgram = ngramData;
    }
};

var postProcessData = function postProcessData (resultData, compressFloat) {
    var keys = Object.keys(resultData.elements),
        childrenKeys,
        validFirst = {},
        sumFirst = 0,
        sumChildren = 0,
        key,
        data,
        i,
        k;

    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        data = resultData.elements[key];

        if (data.probabilityAsFirst > 0) {
            if (!validFirst[key]) {
                validFirst[key] = data.probabilityAsFirst;
                sumFirst += data.probabilityAsFirst;
            } else {
                validFirst[key] += data.probabilityAsFirst;
                sumFirst += data.probabilityAsFirst;
            }
        }

        delete data.probabilityAsFirst;

        childrenKeys = Object.keys(data.children);
        sumChildren = 0;

        for (k = 0; k < childrenKeys.length; k++) {
            sumChildren += data.children[childrenKeys[k]];
        }

        for (k = 0; k < childrenKeys.length; k++) {
            data.children[childrenKeys[k]] /= sumChildren;
            data.children[childrenKeys[k]] = compressFloat(data.children[childrenKeys[k]]);
        }

        data.hasChildren = childrenKeys.length > 0;

        childrenKeys = Object.keys(data.lastChildren);
        sumChildren = 0;

        for (k = 0; k < childrenKeys.length; k++) {
            sumChildren += data.lastChildren[childrenKeys[k]];
        }

        for (k = 0; k < childrenKeys.length; k++) {
            data.lastChildren[childrenKeys[k]] /= sumChildren;
            data.lastChildren[childrenKeys[k]] = compressFloat(data.lastChildren[childrenKeys[k]]);
        }

        data.hasLastChildren = childrenKeys.length > 0;
    }

    keys = Object.keys(validFirst);

    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        validFirst[key] /= sumFirst;
        validFirst[key] = compressFloat(validFirst[key]);
    }

    resultData.firstElements = validFirst;

    return resultData;
};

var compact = function compact (resultData) {
    var keys = Object.keys(resultData.elements),
        ngramData,
        ngramDesc,
        i;

    for (i = 0; i < keys.length; i++) {
        ngramData = resultData.elements[keys[i]];
        ngramDesc = [
            ngramData.hasChildren ? ngramData.children : 0,
            ngramData.hasLastChildren ? ngramData.lastChildren : 0
        ];

        resultData.elements[keys[i]] = ngramDesc;
    }

    resultData.e = resultData.elements;
    resultData.fe = resultData.firstElements;

    delete resultData.elements;
    delete resultData.firstElements;
};

var stringToRegExp = function stringToRegExp (string) {
    var match = string.match(/^\/(.+)\/([igmuy]+)$/),
        regex = null;

    if (match !== null) {
        regex = new RegExp(match[1], match[2]);
    }

    return regex;
};

var preProcessString = function preProcessString (string, config) {
    string = string.toLowerCase();

    if (config.filter) {
        var filterRegex = null;

        if (config.filter instanceof RegExp) {
            filterRegex = config.filter
        } else if (filters.hasOwnProperty(config.filter)) {
            filterRegex = filters[config.filter];
        } else {
            filterRegex = stringToRegExp(config.filter);
        }

        if (filterRegex) {
            string = string.replace(filterRegex, ' ');
        }
    }

    var strings = string.split(/\s+/).filter(function (v) {
        return v.length > 0;
    });

    if (config.minLength) {
        strings = strings.filter(function (v) {
            return v.length > config.minLength;
        });
    }

    if (config.unique) {
        uniq(strings);
    }

    return strings;
};

/**
 * Generate an n-gram model based on a given text
 * @param {string} data Text corpus as a single, preferably large, string
 * @param {object} config Configuration options
 * @param {string} [config.name] Name of the n-gram model, not directly used
 * @param {int} [config.n=3] Order of the model (1: unigram, 2: bigram, 3: trigram, ...)
 * @param {int} [config.minLength=n] Minimum length of the word considered in the generation of the model
 * @param {bool} [config.unique=false] Avoid skewing the generation toward the most repeated words in the text corpus
 * @param {bool} [config.compress=false] Reduce the size of the model file, making it slightly less accurate
 * @param {bool} [config.excludeOriginal=false] Include the full list of the words considered in the generation so they can be blacklisted
 * @param {string|RegExp} [config.filter='extended'] Character filtering option, either one the existing filters (none, alphabetical, numerical, alphaNumerical, extended, extendedNumerical, french, english, oldEnglish, chinese, japanese, noSymbols) or a RegExp object
 * @returns {object} N-gram model built from the text corpus
 */
module.exports = function generateModel (data, config) {
    config = config || {};

    config.name = config.name || null;
    config.filter = config.filter || 'extended';
    config.n = parseInt(config.n, 10) || 3;
    config.minLength = parseInt(config.minLength, 10) || config.n;
    config.unique = !!config.unique;
    config.excludeOriginal = !!config.excludeOriginal;
    config.compress = !!config.compress;

    if (config.minLength < config.n) {
        throw new Error('N-gram error: The minLength value must be larger than or equal to n');
    }

    var resultConfig = {
        name: config.name,
        n: config.n,
        minLength: config.minLength,
        unique: config.unique ? 1 : 0,
        excludeOriginal: config.excludeOriginal ? 1 : 0
    };

    var resultData = {
        elements: {}
    };

    var excludeData = [];

    var strings = preProcessString(data, config);

    for (var i = 0; i < strings.length; i++) {
        doNgram(strings[i], resultData, config);

        if (config.excludeOriginal && excludeData.indexOf(strings[i]) === -1) {
            excludeData.push(strings[i]);
        }
    }

    var formatFloat = config.compress ? function compressFloat (float, precision) {
        return parseFloat(float.toFixed(precision || 7));
    } : function (v) { return v; };

    compact(postProcessData(resultData, formatFloat));

    return {
        config: resultConfig,
        data: resultData,
        exclude: excludeData.length ? excludeData : 0
    };
};
