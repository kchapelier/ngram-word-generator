#!/usr/bin/env node

"use strict";

var fs = require('fs'),
    config = require('minimist')(process.argv.slice(2)),
    ngramProcess = require('./src/ngramProcess');

var ngramOptions = {
    name: config.name || null,
    filter: config.filter || 'extended',
    n: config.n || 3,
    minLength: config.minLength || 4,
    unique: !!config.unique,
    excludeOriginal: !!config.excludeOriginal,
    compress: !!config.compress
};

var jsonSpaces = ngramOptions.compress ? null : 2,
    stream = config._.length ? fs.createReadStream(config._[0]) : process.stdin,
    data = '',
    chunk;

stream.on('readable', function() {
    chunk = stream.read();

    if (chunk !== null) {
        data+= chunk.toString().toLowerCase();
    }
});

stream.on('end', function() {
    var ngramModel = ngramProcess(data, ngramOptions);

    process.stdout.write(JSON.stringify(ngramModel, null, jsonSpaces) + '\n');
});
