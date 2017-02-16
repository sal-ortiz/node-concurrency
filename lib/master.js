var cluster = require("cluster");
var os = require('os');
var path = require("path");

var Message = require(path.join(__dirname, 'message'));
var Worker = require(path.join(__dirname, 'worker'));
var Shared = require(path.join(__dirname, 'shared'));

var numCPUs = require("os").cpus().length;


var Async = function(){
  var workers = [];
  var currentWorker = -1;
  var swapFile = path.join(os.tmpdir(), ('__npc-' + process.pid + '.swap'));

  var shared = new Shared({
    'swap': swapFile,
  });

  cluster.setupMaster({
    exec: path.join(__dirname, 'worker.js')
  });

  for (var cpuNum = 0; cpuNum < numCPUs; cpuNum += 1){

    var worker = new Worker({
      'shared': shared,
      'onMessage': function(msg){
        //var msg = new Message();
        //msg.setPayload('ping', Shared.ping.master_message);
        //this.process.send(msg);
      }
    });
    workers.push(worker);

  };

  return {
    shared: shared,

    execute: function(idOrFunc, args, options){
      // delegate method to allow simplified use.

      if (typeof idOrFunc == 'string')
      {
        // our input is the name of an action to execute.
        this.executeAction(idOrFunc, args, options);
      }
      else if (typeof idOrFunc == 'function')
      {
        // our input is a function to execute.
        this.executeFunction(idOrFunc, args, options);
      }

    },

    executeAction: function(id, args, options){
      var options = options || {};
      var workerIndex = ++currentWorker % workers.length;
      var msg = new Message();

      msg.setPayload('action', {
        'id': id,
        'arguments': args || [],
        'options': options || {},
      });

      workers[workerIndex].send(msg);
    },

    executeFunction: function(func, args, options){
      actionName = process.pid.toString() +
        '-' + Math.round(Math.random() * 10e15).toString(36);

      this.shared.set(actionName, func);
      this.executeAction(actionName, args, options);
    }


  };

};

module.exports = Async(); // it's a module!
