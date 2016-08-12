"use strict";

/**
 * Select a random element in a weighted list
 * @param {object} list Weighted list (value: probability)
 * @param {function} [rng] Random number generator function, default to Math.random
 * @returns {string} Selected element
 */
var selectRandom = function selectRandom (list, rng) {
    var select = rng(),
        keys = Object.keys(list),
        key,
        i;

    for (i = 0; i < keys.length && select > 0; i++) {
        key = keys[i];
        select -= list[key];
    }

    return key;
};

var makeGenerator = function makeGenerator (model) {
    var config = model.config,
        data = model.data,
        exclude = model.exclude;

    var ngramGenerator = function ngramGenerator (firstNgram, lengthHint, rng) {
        var ngram = firstNgram || selectRandom(data.fe, rng), //random first element
            result = ngram,
            ngramData = data.e[ngram],
            loop = ngramData[0] || ngramData[1];

        while (loop) {
            if (
                //we are past the lengthHint and there are last children for the current ngram
                (lengthHint <= result.length && ngramData[1] !== 0) ||
                //we do not have any more (non-last) children
                (ngramData[0] === 0)
            ) {
                ngram = selectRandom(ngramData[1], rng); //random last child
                result += ngram.substr(-1);
                loop = false; //get out of the loop
            } else {
                ngram = selectRandom(ngramData[0], rng); //random child
                result += ngram.substr(-1);
                ngramData = data.e[ngram]; //set up the next set of probabilities
            }
        }

        return result;
    };

    var generator = function generator (lengthHint, rng) {
        var result;

        rng = rng || Math.random;

        do {
            result = ngramGenerator(null, lengthHint, rng);
        } while(exclude !== 0 && exclude.indexOf(result) !== -1);

        return result;
    };

    /*
    generator.bruteForceList = function (lengthHintMin, lengthHintMax, numberHint, rng) {
        var numberTries = numberHint * 2,
            lengthHintBase = Math.min(lengthHintMax, lengthHintMin),
            lengthHintDelta = Math.abs(lengthHintMax - lengthHintMin),
            results = [],
            result;

        rng = rng || Math.random;

        do {
            result = ngramGenerator(null, lengthHintBase + (rng() * lengthHintDelta + 1) | 0, rng);
            numberTries--;

            if (results.indexOf(result) === -1) {
                results.push(result);
                numberHint--;
            }
        } while (numberTries > 0 && numberHint > 0);

        results.sort();

        return results;
    };

    generator.complete = function (start, lengthHint, rng) {
        var position = -config.n,
            ngram;

        rng = rng || Math.random;

        while (start.length + position >= 0) {
            ngram = start.substr(position, config.n);

            if (data.e[ngram] && (data.e[ngram][0] || data.e[ngram][1])) {
                break;
            }

            ngram = null;
            position--;
        }

        return start.substr(0, start.length + position) + ngramGenerator(ngram, lengthHint - start.length - position, rng);
    };
    */

    return generator;
};

module.exports = makeGenerator;
