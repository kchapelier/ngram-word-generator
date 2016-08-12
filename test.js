var data = require('./test-compressed3.json'),
    makeGenerator = require('./index');

var generator = makeGenerator(data);

var s = [];
var time = Date.now();

for (var x = 0; x < 2000; x++) {
    //s += generate(4 + (Math.random() * 4) | 0);
    var firstname = generator(7 + (Math.random() * 10) | 0);
    s.push(firstname[0].toUpperCase() + firstname.substr(1));
}

console.log(s.join(', '));

console.log(Date.now() - time);
