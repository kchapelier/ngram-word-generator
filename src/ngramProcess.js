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
}

var postProcessData = function postProcessData (resultData) {
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
            data.children[childrenKeys[k]] = parseFloat(data.children[childrenKeys[k]].toFixed(7), 10);
        }

        data.hasChildren = childrenKeys.length > 0;

        childrenKeys = Object.keys(data.lastChildren);
        sumChildren = 0;

        for (k = 0; k < childrenKeys.length; k++) {
            sumChildren += data.lastChildren[childrenKeys[k]];
        }

        for (k = 0; k < childrenKeys.length; k++) {
            data.lastChildren[childrenKeys[k]] /= sumChildren;
            data.lastChildren[childrenKeys[k]] = parseFloat(data.lastChildren[childrenKeys[k]].toFixed(7), 10);
        }

        data.hasLastChildren = childrenKeys.length > 0;
    }

    keys = Object.keys(validFirst);

    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        validFirst[key] /= sumFirst;
        validFirst[key] = parseFloat(validFirst[key].toFixed(7), 10);
    }

    resultData.firstElements = validFirst;

    return resultData;
}

var compact = function compact (resultData) {
    var keys = Object.keys(resultData.elements),
        ngramData,
        ngramDesc,
        i;

    for (i = 0; i < keys.length; i++) {
        ngramData = resultData.elements[keys[i]];
        ngramDesc = [
            (ngramData.hasChildren || ngramData.hasLastChildren) ? 1 : 0,
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

var preProcessString = function preProcessString (string, config) {
    if (config.filter && filters.hasOwnProperty(config.filter)) {
        string = string.replace(filters[config.filter], ' ');
    }

    var strings = string.split(/[ \n\r]/).filter(function (v) { return v; });

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

module.exports  = function process (data, config) {
    config.n = parseInt(config.n, 10) || 2;
    config.minLength = parseInt(config.minLength, 10) || 0;
    config.filter = config.filter || 'alphaNumerical';
    config.unique = !!config.unique;
    config.excludeOriginal = !!config.excludeOriginal;

    var resultConfig = {
        name: config.name,
        type: config.type,
        n: config.n
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

    compact(postProcessData(resultData));

    return {
        config: resultConfig,
        data: resultData,
        exclude: excludeData.length ? excludeData : 0
    };
};
