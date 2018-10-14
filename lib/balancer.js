const Path = require('path');

const libPath = Path.join(__dirname, 'balancer');
const RoundRobinBalancer = require(Path.join(libPath, 'round_robin.js'));


class Balancer {

  static get RoundRobin() {
    return RoundRobinBalancer;
  }

}


module.exports = Balancer;
