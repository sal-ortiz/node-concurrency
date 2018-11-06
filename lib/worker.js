
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

      let handler = (message) => {
        let msg = Message.deserialize(message);

        let promise = this.promises[msg.promise];

        promise.resolve(msg.response);
      };

      this.process = this.constructor.start(handler.bind(this), env);
    }

    return this.process;
  }

  send(msg) {
    this.process.send(msg); // send to our worker process
  }


  static generateExecuteMessage(func, args, delay) {
    let msg = new Message({
      action: func,
      arguments: args,
      delay: delay,
    });

    return msg;
  }

  static generatePromiseData(resolve, reject) {
    return {
      resolve: resolve,
      reject: reject,

    };
  }


  execute(func, args) {
    let msg = this.constructor.generateExecuteMessage(func, args);

    return this.constructor.execute(this, msg);
  }

  executeTimeout(func, delay, args) {
    let msg = this.constructor.generateExecuteMessage(func, args, delay);

    return this.constructor.execute(this, msg);
  }

  static execute(worker, msg) {

    return new Promise(function(worker, msg, resolve, reject) {
      msg.payload.promise = this.generatePromiseId();
      worker.promises[msg.payload.promise] = this.generatePromiseData(resolve, reject)

      worker.send(msg.serialize());
    }.bind(this, worker, msg));
  }


  static generatePromiseId() {
    return process.pid.toString() + '-' + Math.round(Math.random() * 10e15).toString(36);
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

    return msg.action.apply(this, args);
  }

}



// The runtime context, from here, is from within a worker process..
if (require.main === module) {
  // our file was called directly rather than req'd.
 //

  function responseFormat(ret, promiseId) {
    return {
      response: ret,
      promise: promiseId,
    }

  }

  process.on('message', (message) => {
    // handle a message from the master.

    let msg = Message.deserialize(message);
    //let ret = {
    //  response: Worker.onMessage(msg),
    //  promise: msg.promise,
    //};

    let promise;
    if (msg.delay) {
      let timeoutPromise = new Promise(function(msg, resolve, reject) {

        setTimeout(function(msg, resolve, reject) {
          let ret = Worker.onMessage(msg);

          resolve(ret);
        }.bind(undefined, msg, resolve, reject), msg.delay);

      }.bind(undefined, msg));

      timeoutPromise.then(function(msg, ret) {
        let res = responseFormat(ret, msg.promise);
        let outbound = new Message(res);

        process.send(outbound.serialize());
      }.bind(undefined, msg));

    } else {
      let ret = Worker.onMessage(msg);
      let res = responseFormat(ret, msg.promise);

      let outbound = new Message(res);
      process.send(outbound.serialize());
    }

  });

} else {
  // our file is loaded in a require(...) statement.
  module.exports = Worker;

}
