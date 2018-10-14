# node-concurrency
Asynchronous execution across multiple processes with Node Clusters.

## How It Works
Using the mechanism intended to sync up [Node Clusters](https://nodejs.org/api/cluster.html), we pass serialized data between processes to allow for the execution of arbitrary user functions in worker processes rather than from the main process's [Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/).

The bulk of the *magic* is achieved using simple [serialization tricks](https://github.com/slackjockey/node-concurrency/blob/master/lib/message.js); Just a bit of an augmentation on JavaScript's standard [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Methods) functionality.

## Getting Started
### Installation:
```
npm install --save node-concurrency
```

### Initialization:
```
const Master = require('node-concurrency');
const Async = new Master();

Async.startWorker();
```
Note that the amount of workers that can be started using ```Async startWorker()``` is unlimited, provided you start at least one. However, the general consensus is to start one per CPU, as in:
```
const numCPUs = require("os").cpus().length;

for (let cnt = 0; cnt < numCPUs; cnt++) {
  Async.startWorker();
}
```

### Usage:
```
Async.execute(function() {
  console.log('Hello from process #' + process.pid);
});
```
The function called above can also take optional arguments, provided after the initial function argument. The call returns a JavaScript Promise. The value returned from the provided function is then passed along the subsequent chain.
```
let promise = Async.execute(function(parentPid) {
  let msg = 'Hello to process #' + parentPid +
      ' from process #' + process.pid;

    return msg;
}, process.pid);

```
Which can, of couse, be extended by:
```
promise.then(function(msg) {
  console.log(msg);
});
```

## Caveats:

### Scope
Because user code executed by the ```execute``` function is to be done so from a different process, it is safe to assume that any global scope is not available to the function, as it would be within the scope it was declared.

For example, the following code will fail, due to an *Unknown Identifier* error on ```val```:
```
let val = 'Hello';

Async.execute(function() {
  console.log(val);
});
```
Try something like this instead:
```
let val = 'Hello';

Async.execute(function(msg) {
  console.log(msg);
}, val);

```
So we can pass values into the function instead of using the global scope. *Magically*, we can do this with most values, functions, objects, etc.

See, however, that each of the two examples above implies access to the ```console``` global. This is correct because it is provided by the Node runtime rather than from another module, not loaded as part of the runtime.

Consider each worker process as an independent instance of the Node interpreter. As such, you would still have access to globals like ```console``` and ```process``` but currently cannot automatically load other libraries in the worker processes. Check it out:
```
Async.execute(function() {
  return process.pid;
}).then(function(workerPID) {
  console.log('master pid: ' + process.pid);
    console.log('worker pid: ' + workerPID);
});
```
The current implementation of this module only really allows for arbitrary functions, however.

### Native Functions and Circular References
Much of the module's functionality is derived from it's [serialization](https://github.com/slackjockey/node-concurrency/blob/master/lib/message.js), which is capable of working with values, objects and functions alike. However, it is currently not capable of working with *native* functions as much of it's serialization is not *new* technology, but rather leveraging *existing* technology.

As such, this module is also unable to work with [circular references](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value).
