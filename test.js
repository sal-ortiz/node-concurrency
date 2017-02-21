var path = require('path')
var Async = require(path.join(__dirname, 'lib', 'master'));


Async.shared.set('testValue', Math.round(Math.random() * 10e15));

// an action that returns a value to execute asynchronously.
var triggerResponse = function(){
  console.log('called!');
  return this.payload.testValue + Math.round(Math.random() * 10e15);
}

// an asynchronous handler to accept the response.
var handleResponse = function(res){
  console.log('returned!\t', JSON.stringify(res));
}


// a set-and-execute model.
Async.shared.set('helloWorld', triggerResponse);
Async.execute('helloWorld').then(handleResponse);

// a slightly slower on-the-fly method.
Async.execute(triggerResponse).then(handleResponse);
