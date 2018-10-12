const Path = require("path");

const Message = require(Path.join(__dirname, 'message'));
const Worker = require(Path.join(__dirname, 'worker'));

const numCPUs = require("os").cpus().length;


class Master {

  constructor() {
    this.workers = [];
    this.currentWorker = -1;
  }

  startWorker() {
    let worker = new Worker();

    worker.start();
    this.workers.push(worker);

    return worker;
  }

  execute(func /* ... */) {
    let numWorkers = this.workers.length;
    let workerIndex = ++this.currentWorker % numWorkers;
    let args = [...arguments].slice(1);

    let worker = this.workers[workerIndex];
    return worker.execute(func, args);
  }

}


module.exports = Master; // it's a module!
