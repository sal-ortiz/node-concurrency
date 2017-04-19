var path = require("path");

var Message = require(path.join(__dirname, 'message'));
var Worker = require(path.join(__dirname, 'worker'));

var numCPUs = require("os").cpus().length;


class Master {

  constructor(options) {
    var options = options || {};

    this.workers = [];
    this.currentWorker = -1;
  }

  startWorker() {
    var worker = new Worker();

    worker.start();
    this.workers.push(worker);
    return worker;
  }

  send(msg) {
    var workerIndex = ++this.currentWorker % this.workers.length;
    this.workers[workerIndex].send(msg);
  }

  execute(func /* ... */) {
    var workerIndex = ++this.currentWorker % this.workers.length;
    var args = [...arguments].slice(1);

    return this.workers[workerIndex].execute(func, args);
  }

}


module.exports = Master; // it's a module!
