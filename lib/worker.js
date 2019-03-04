
const Cluster = require("cluster");
const Path = require("path");

const Message = require(Path.join(__dirname, 'message.js'));


class Worker {

  constructor() {
    this.promises = {};
    this.parent = process;
  }

  start(onMessage, envInput) {

    if (!this.process) {
      let env = envInput || {
        //parent: this.parent.pid,
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

    return new Promise(((worker, msg, resolve, reject) => {
      let data = this.generatePromiseData(resolve, reject);
      let id = this.generatePromiseId();

      msg.payload.promise = id;
      worker.promises[id] = data;

      worker.send(msg.serialize());
    }).bind(this, worker, msg));
  }

  static generatePromiseId() {
    let pid = process.pid;
    let salt = Math.round(Math.random() * 10e15);

    return [pid.toString(), salt.toString(36)].join('-');
  }

  static start(onMessage, env) {
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
          let ret = msg.action.apply(this, args);

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

        }

      }

    }

    return output;
  }

  static workerAction() {
    let args = Worker.parseArguments(process.argv);
    let reqs = {};

    for (let key in args.require) {
      // import some require'd libs.
      let path = args.require[key];

      reqs[key] = require(path);
    }

    process.on('message', (message) => {
      // handle a message from the master.
      let msg = Message.deserialize.call(reqs, message);

      Worker.onMessage.call(reqs, msg)
        .then(Worker.sendResponseMessage.bind(Worker, msg));

    });

  }

  static get Message() {
    return Message;
  }

}

if (require.main === module) {

  // The runtime context, from here, is from within a worker process..
  Worker.workerAction();

} else {

  // our file is loaded in a require(...) statement.
  module.exports = Worker;

}
