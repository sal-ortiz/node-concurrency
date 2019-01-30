
const Path = require("path");

const Worker = require(Path.join(__dirname, 'worker.js'));
const Balancer = require(Path.join(__dirname, 'balancer.js'));


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

  stopWorker() {
    let worker = this.workers.pop();

    if (worker) {
      worker.stop();
    }

  }

  execute(func /* ... */) {
    if (this.workers.length < 1) {
      this.startWorker();
    }

    let args = Array.from(arguments).slice(1);
    let worker = this.balancer.next();

    return worker.execute(func, args);
  }

  executeTimeout(func, delay /*, ... */) {
    if (this.workers.length < 1) {
      this.startWorker();
    }

    let args = Array.from(arguments).slice(2);
    let worker = this.balancer.next();

    return worker.executeTimeout(func, delay, args);
  }

}


module.exports = Master;
