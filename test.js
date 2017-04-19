var path = require('path')
var numCPUs = require("os").cpus().length;

var Master = require(path.join(__dirname, 'lib', 'master'));
var Message = require(path.join(__dirname, 'lib', 'message'));

console.log('Runtime started at', new Date().getTime());
var Async = new Master();

for (var workerCount = numCPUs; workerCount > 0; workerCount--) {
  Async.startWorker();
}

var asyncMethod = function(val) {
  console.log('action [' + new Date().getTime() + ']:');
  return val + 1;
}

var asyncResponder = function(res) {
  console.log('responder [' + new Date().getTime() + ']:', res);
}


for (var taskCount = 0; taskCount < 10000;taskCount++) {
  Async.execute(asyncMethod, taskCount).then(asyncResponder);
}
