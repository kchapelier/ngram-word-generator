"use strict";

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

var makeGenerator = function makeGenerator (model, rng) {
    var config = model.config,
        data = model.data,
        exclude = model.exclude;

    rng = rng || Math.random;

    function ngramGenerator (lengthHint) {
        var ngram = selectRandom(data.fe, rng), //random first element
            result = ngram,
            ngramData = data.e[ngram],
            loop = ngramData[0];

        while (loop) {
            if (
                //we are past the lengthHint and there are last children for the current ngram
                (lengthHint <= result.length && ngramData[2] !== 0) ||
                //we do not have any more (non-last) children
                (ngramData[1] === 0)
            ) {
                ngram = selectRandom(ngramData[2], rng); //random last child
                result += ngram.substr(-1);
                loop = false; //get out of the loop
            } else {
                ngram = selectRandom(ngramData[1], rng); //random child
                result += ngram.substr(-1);
                ngramData = data.e[ngram]; //set up the next set of probabilities
            }
        }

        return result;
    }

    function generator (lengthHint) {
        var result;

        do {
            result = ngramGenerator(lengthHint);
        } while(exclude !== 0 && exclude.indexOf(result) !== -1);

        return result;
    }

    return generator;
};

module.exports = makeGenerator;
