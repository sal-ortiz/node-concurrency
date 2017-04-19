var path = require("path");
var cluster = require("cluster");
var Message = require(path.join(__dirname, 'message'));



class Worker {

  constructor(options) {
    var options = options || {};

    this.promises = {};
    this.parent = process;
    this.env = {
      parent: this.parent.pid,
    };
  }

  start(onMessage, env) {
    if (!this.process) {
      var env = env || {
        parent: this.parent.pid,
      };

      var promises = this.promises
      var onMessageHandler = function(msg) {
        var message = Message.deserialize(msg);
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
    var workerObj = this;
    var promises = workerObj.promises

    return new Promise(function(resolve, reject) {
      var promiseId = process.pid.toString() +
        '-' + Math.round(Math.random() * 10e15).toString(36);

      var msg = new Message({
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

    var process = cluster.fork(env);
    process.on('message', onMessage);  // msg from worker.

    return process;
  }

  static onMessage(msg) {
    // handle a message from the master.
    var args = msg.arguments;

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

    var message = Message.deserialize(msg);
    var ret = Worker.onMessage(message);
    var ret = {
      response: Worker.onMessage(message),
      promise: message.promise,
    };


    var outbound = new Message(ret);
    process.send(outbound.serialize());
  });

} else {
  // our file is loaded in a require(...) statement.
  module.exports = Worker;

}
