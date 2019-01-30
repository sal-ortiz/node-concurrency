
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

  stop() {
    let process = this.process.process;

    process.kill('SIGTERM');
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

  static sendResponseMessage(msg, content) {
    let payload = {
      promise: msg.promise,
      response: content,
    };

    let res = new Message(payload);

    process.send(res.serialize());
  }


  static onMessage(msg) {

    let promise = new Promise((resolve, reject) => {

      let func = () => {
        let args = msg.arguments;

        try {
          let ret = msg.action.apply(Worker, args);

          resolve(ret);
        } catch(err) {

          reject(err);
        }

      };

      if (msg.delay) {
        setTimeout(func, msg.delay);
      } else {
        setImmediate(func);
      }

    });

    return promise;
  }

  static parseArguments(argsAry) {
    let args = new Array(...argsAry);  // non-destructive.
    let output = {};

    while (args.length) {
      let arg = args.shift();

      if (arg.match(/^--[^\s]+$/)) {
        // it's a flag.

        switch(arg.toLowerCase()) {
          case '--require':
            let param = args.shift();
            let components = param.split(/[\s]*\=[\s]*/);

            output.require = output.require || {};
            output.require[components[0]] = components[1];
            break;

          case '--worker':
            let path = args.shift();

            output.worker = path;
            break;
        }

      }

    }

    return output;
  }

}



// The runtime context, from here, is from within a worker process..
if (Cluster.isWorker) {
  // our file was called directly rather than req'd.


  let args = Worker.parseArguments(process.argv);

  for (let key in args.require) {
    // import some require'd libs.
    let path = args.require[key];

    this[key] = require(path);
  }

  let UserWorker = args.worker && require(args.worker);



  process.on('message', (message) => {
    // handle a message from the master.

    let msg = Message.deserialize(message);

    let workerObj = UserWorker || Worker;
    workerObj.onMessage(msg)
      .then(workerObj.sendResponseMessage.bind(undefined, msg));

  });

} else {
  // our file is loaded in a require(...) statement.
  module.exports = Worker;

}
