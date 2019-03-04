
const Path = require("path");
const Cluster = require("cluster");

const BASE_WORKER_PATH = Path.join(__dirname, 'worker.js');

const BaseWorker = require(BASE_WORKER_PATH);
const Balancer = require(Path.join(__dirname, 'balancer.js'));


class Master {

  constructor(options) {
    let opts = options || {};

    this.workers = [];

    this.setBalancer(opts.balancer || Balancer.RoundRobin);
    this.setDependencies(opts.requires || {});
  }

  startWorker() {
    let worker = new BaseWorker();
    let argsAry = [];

    if (this.requires) {
      let requires = this.requires;
      let names = Object.keys(requires);

      for (let name in requires) {
        let arg = ['--require', (name + '=' + requires[name])];

        argsAry = argsAry.concat(arg);
      }

    }

    Cluster.setupMaster({
      exec: BASE_WORKER_PATH,
      args: argsAry,
    });

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
      // if no workers active, start one.
      this.startWorker();
    }

    let args = Array.from(arguments).slice(2);
    let worker = this.balancer.next();

    return worker.executeTimeout(func, delay, args);
  }

  setDependency(name, path) {
    this.setDependencies(this.requires || {});

    this.requires[name] = path;
  }

  setDependencies(deps) {
    this.requires = deps;
  }

  setBalancer(balancerObj) {
    this.balancer = new balancerObj(this.workers);
  }

  static get Worker() {
    return BaseWorker;
  }

}


module.exports = Master;
