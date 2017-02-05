var path = require('path')

var Async = require(path.join(__dirname, 'lib', 'master'));

Async.setAction('helloWorld', function(){
  console.log("Hello World!");
});


Async.execute('helloWorld');
Async.execute('helloWorld');
Async.execute('helloWorld');
Async.execute('helloWorld');
Async.execute('helloWorld');
