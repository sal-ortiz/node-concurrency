const Path = require("path");

const Message = require(Path.join(__dirname, 'message.js'));
const Worker = require(Path.join(__dirname, 'worker.js'));
const Balancer = require(Path.join(__dirname, 'balancer.js'));

const numCPUs = require("os").cpus().length;


class Master {

  constructor() {
    this.workers = [];

    this.balancer = new Balancer.RoundRobin(this.workers);
  }

  startWorker() {
    let worker = new Worker();

    worker.start();
    this.workers.push(worker);

    return worker;
  }

  execute(func /* ... */) {
    let args = [...arguments].slice(1);
    let worker = this.balancer.next();

    return worker.execute(func, args);
  }

}


module.exports = Master; // it's a module!
