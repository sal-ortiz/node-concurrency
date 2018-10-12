# node-concurrency
Asynchronous action execution across multiple processes with Node Clusters, ensuring truly concurrent execution. No Event Loop.

#### How It Works
Using the IPS mechanism used to sync up Node Clusters, we pass meta between processes, triggering the execution of arbitrary user functions asynchronously.

This is achieved using fairly involved, but actually quite simple, serialization and deserialization. Just a bit of an augmentation on the standard JSON functionality.

#### Getting Started
##### Installation:
```
npm install --save node-concurrency
```

##### Initialization:
```
const Master = require('node-concurrency');

const Async = new Master();

```

##### Usage:
```
Async.execute(() => {
  console.log('Hello from process #' + process.pid);
});
```
The function called above can also take optional arguments, provided after the initial function argument. The call returns a JavaScript Promise. The value returned from the provided function is then passed along the subsequent chain.
```
let promise = Async.execute((parentPid) => {
  let msg = 'Hello to process #' + parentPid +
      ' from process #' + process.pid;

    return msg;
}, process.pid);

```
Which can, of couse, be extended extended by:
```
promise.then((msg) => {
  console.log(msg);
});
```
