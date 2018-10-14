



class RoundRobinBalancer {

  constructor(workers) {
    this.workers = workers;
    this.index = -1;
  }

  next() {
    this.index = ++this.index % this.workers.length;

    return this.workers[this.index];
  }

  prev() {
    if (--this.index < 0) {
      this.index = this.workers.length - 1;
    }

    return this.workers[this.index];
  }

}



module.exports = RoundRobinBalancer;
