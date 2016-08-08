#!/usr/bin/env node

"use strict";

var fs = require('fs'),
    config = require('minimist')(process.argv.slice(2));

config.type = config.type || 'ngram';
config.file = config.file || null;
config.space = parseInt(config.space, 10) || null;
config.name = config.name || 'untitled';
config.filter = config.filter || 'alphaNumerical';
config.n = config.n || 2;
config.minLength = config.minLength || 4;
config.unique = !!config.unique;
config.excludeOriginal = !!config.excludeOriginal;

var processes = {
    ngram: require('./src/ngramProcess')
};

function readToEnd (file, callback) {
    var stream = file ? fs.createReadStream(file) : process.stdin,
        data = '',
        chunk;

    stream.on('readable', function() {
        chunk = stream.read();

        if (chunk !== null) {
            data+= chunk.toString().toLowerCase();
        }
    });

    stream.on('end', function() {
        process.stdout.write(JSON.stringify(callback(null, data), null, config.space) + '\n');
    });
}

readToEnd(config.file, function (error, data) {
    var process = processes[config.type];

    if (process) {
        return process(data, config);
    } else {
        throw new Error('Type unknown : ' + config.type);
    }
});
