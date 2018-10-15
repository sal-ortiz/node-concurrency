
const Cluster = require("cluster");
const Path = require("path");

const Message = require(Path.join(__dirname, 'message'));


class Worker {

  constructor() {
    this.promises = {};
    this.parent = process;
  }

  start(onMessage, envInput) {

    if (!this.process) {
      let env = envInput || {
        parent: this.parent.pid,
      };

      let promises = this.promises
      let handler = (msg) => {
        let message = Message.deserialize(msg);
        let promise = promises[message.promise];

        promise.resolve(message.response);
      };

      this.process = this.constructor.start(handler, env);
    }

    return this.process;
  }

  send(msg) {
    this.process.send(msg); // send to our worker process
  }

  execute(func, args) {
    let worker = this;
    let promises = worker.promises

    return new Promise((resolve, reject) => {
      let promiseId = process.pid.toString() + '-'
        + Math.round(Math.random() * 10e15).toString(36);

      let msg = new Message({
        action: func,
        arguments: args,
        promise: promiseId,
      });

      promises[promiseId] = {
        resolve: resolve,
        reject: reject,
      };

      worker.send(msg.serialize());
    });

  }

  static start(onMessage, env) {
    Cluster.setupMaster({
      exec: __filename,
    });

    let process = Cluster.fork(env);
    process.on('message', onMessage);  // msg from worker.

    return process;
  }

  static onMessage(msg) {
    // handle a message from the master.
    let args = msg.arguments;

    let res = msg.action.apply(this,
      (args.constructor != Array) ? [args] : args
    );

    return res;
  }

}



// The runtime context, from here, is from within a worker process..
if (require.main === module) {
  // our file was called directly rather than req'd.
  process.on('message', (msg) => {
    // handle a message from the master.

    let message = Message.deserialize(msg);
    let ret = {
      response: Worker.onMessage(message),
      promise: message.promise,
    };

    let outbound = new Message(ret);
    let outp = outbound.serialize();

    process.send(outp);
  });

} else {
  // our file is loaded in a require(...) statement.
  module.exports = Worker;

}
