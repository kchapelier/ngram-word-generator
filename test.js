var data = require('./tests/french-firstnames.json'),
    makeGenerator = require('./index');

var generator = makeGenerator(data);


var time = Date.now();

var s = [];
for (var x = 0; x < 2000; x++) {
    //s += generator(4 + (Math.random() * 4) | 0);
    var firstname = generator(7 + (Math.random() * 10) | 0);
    s.push(firstname[0].toUpperCase() + firstname.substr(1));
}
console.log(s.join(', '));

/*
var dictionary = generator.dictionary(7);
console.log(dictionary.join(', '), dictionary.length);
*/

console.log(Date.now() - time);
