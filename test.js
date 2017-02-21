var path = require('path')
var Async = require(path.join(__dirname, 'lib', 'master'));

Async.shared.set('testValue', Math.round(Math.random() * 10e15));
Async.shared.set('helloWorld', function(){
  console.log('called!');
  return 667;
});


Async.execute('helloWorld').then(function(res){ console.log('returned!\t', JSON.stringify(res)); });

Async.execute(function(){
  console.log('called!');
  return 666;
}).then(function(res){ console.log('returned!\t', JSON.stringify(res)); });
