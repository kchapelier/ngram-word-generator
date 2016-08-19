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

/**
 * Make a word generator function based on a given n-gram model
 * @param {object} model N-gram model
 * @returns {Function} Word generator function
 */
var makeGenerator = function makeGenerator (model) {
    var config = model.config,
        data = model.data,
        exclude = model.exclude;

    /**
     * Generate a word
     * @param {string|null} [firstNgram] First n-gram of the word, select a random one otherwise.
     * @param {int} lengthHint Suggested word length
     * @param {function} [rng] Random number generator function, default to Math.random
     * @returns {*|string}
     */
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

    /**
     * Generate a word, blacklist with the exclude list
     * @param {int} lengthHint Suggested word length
     * @param {function} [rng] Random number generator function, default to Math.random
     * @returns {string} Generated word
     */
    var generator = function generator (lengthHint, rng) {
        var result;

        rng = rng || Math.random;

        do {
            result = ngramGenerator(null, lengthHint, rng);
        } while (exclude !== 0 && exclude.indexOf(result) !== -1);

        return result;
    };

    /**
     * Recursively crawl the ngram tree and populate the dictionary
     * @param {int} lengthMin Minimum length of the word included in the dictionary
     * @param {int} lengthMax Maximum length of the word included in the dictionary
     * @param {string} string
     * @param {object} ngramData
     * @param {Array} dictionary
     */
    var dictionaryRecursive = function dictionaryRecursive (lengthMin, lengthMax, string, ngramData, dictionary) {
        var i,
            ngrams,
            ngram;

        // recursion on the children if lengthMax not reached yet
        if (string.length < lengthMax - 1 && ngramData[0]) {
            ngrams = Object.keys(ngramData[0]);

            for (i = 0; i < ngrams.length; i++) {
                ngram = ngrams[i];

                dictionaryRecursive(lengthMin, lengthMax, string + ngram.substr(-1), data.e[ngram], dictionary);
            }
        }

        // complete word with last children if the valid range
        if (string.length >= lengthMin - 1 && ngramData[1]) {
            ngrams = Object.keys(ngramData[1]);

            for (i = 0; i < ngrams.length; i++) {
                var generated = string + ngrams[i].substr(-1);

                if (exclude === 0 || exclude.indexOf(generated) === -1) {
                    dictionary.push(generated);
                }
            }
        }
    };

    /**
     * Generate a comprehensive dictionary (list) of generated words
     * @param {int} lengthMin Minimum length of the word included in the dictionary
     * @param {int} [lengthMax] Maximum length of the word included in the dictionary, default to lengthMin.
     * @returns {string[]} Comprehensive list of all the possible words in the length range
     */
    generator.dictionary = function dictionary (lengthMin, lengthMax) {
        var firstNgrams = Object.keys(data.fe),
            dictionary = [],
            i;

        lengthMax = lengthMax || lengthMin;

        for (i = 0; i < firstNgrams.length; i++) {
            dictionaryRecursive(lengthMin, lengthMax, firstNgrams[i], data.e[firstNgrams[i]], dictionary);
        }

        dictionary.sort();

        return dictionary;
    };

    /*
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
