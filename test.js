var path = require('path')
var Async = require(path.join(__dirname, 'lib', 'master'));

Async.shared.set('testValue', Math.round(Math.random() * 10e15));
Async.shared.set('helloWorld', function(){
  console.log(this.get('testValue'));
});


Async.execute('helloWorld');
Async.execute('helloWorld');

Async.execute(function(){
  console.log(this);
});
