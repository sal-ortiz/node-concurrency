#!/usr/bin/node

const Path = require('path');
const numCPUs = require("os").cpus().length;

const Master = require(Path.join(__dirname, 'lib', 'master.js'));

const numTasks = 10000;
const promises = new Array(numTasks);


let asyncMethod = (val) => {
  console.log('action(' + process.pid + ') [' + Date.now() + ']: ');

  return val + 1;
};

let asyncResponder = (res) => {
  console.log('responder(' + process.pid + ') [' + Date.now() + ']:', res);
};

let startTime = Date.now();

console.log('Runtime started at ' + startTime + ' from process ' + process.pid);
let Async = new Master();

for (let workerCount = numCPUs; workerCount > 0; workerCount--) {
  Async.startWorker();
}

for (let taskCount = 0; taskCount < numTasks;taskCount++) {
  let promise = Async.execute(asyncMethod, taskCount).then(asyncResponder);
  promises[taskCount] = promise;
}

Promise.all(promises).then(() => {
  let endTime = Date.now();
  console.log(numTasks + ' tasks completed in ' + (endTime - startTime) + 'ms');

  process.exit();
});
