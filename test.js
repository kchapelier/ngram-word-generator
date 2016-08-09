var data = require('./tests/french-firstnames-compressed.json'),
    generator = require('./index');

var generate = generator(data);

var s = [];
var time = Date.now();

for (var x = 0; x < 70; x++) {
    //s += generate(4 + (Math.random() * 4) | 0);
    var firstname = generate((Math.random() * 15) | 0);

    s.push(firstname[0].toUpperCase() + firstname.substr(1));
}

console.log(s.join(', '));

console.log(Date.now() - time);
