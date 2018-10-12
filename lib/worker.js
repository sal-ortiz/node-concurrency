const Path = require("path");
const cluster = require("cluster");
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
      let onMessageHandler = function(msg) {
        let message = Message.deserialize(msg);
        promises[message.promise].resolve(message.response);
      };

      this.process = this.constructor.start(onMessageHandler, env);
    }

    return this.process;
  }

  send(msg) {
    this.process.send(msg); // send to our worker process
  }

  execute(func, args) {
    let workerObj = this;
    let promises = workerObj.promises

    return new Promise(function(resolve, reject) {
      let promiseId = process.pid.toString() +
        '-' + Math.round(Math.random() * 10e15).toString(36);

      let msg = new Message({
        action: func,
        arguments: args,
        promise: promiseId,
      });

      promises[promiseId] = {};
      promises[promiseId].resolve = resolve;
      promises[promiseId].reject = reject;
      workerObj.send(msg.serialize());
    });

  }

  static start(onMessage, env) {
    cluster.setupMaster({
      exec: __filename,
    });

    let process = cluster.fork(env);
    process.on('message', onMessage);  // msg from worker.

    return process;
  }

  static onMessage(msg) {
    // handle a message from the master.
    let args = msg.arguments;

    return msg.action.apply(this,
      (args.constructor != Array) ? [args] : args
    );
  }

}





// The runtime context, from here, is from within a worker process..
if (require.main === module) {
  // our file was called directly rather than req'd.
  process.on('message', function(msg) {
    // handle a message from the master.

    let message = Message.deserialize(msg);
    let ret = {
      response: Worker.onMessage(message),
      promise: message.promise,
    };


    let outbound = new Message(ret);
    process.send(outbound.serialize());
  });

} else {
  // our file is loaded in a require(...) statement.
  module.exports = Worker;

}
