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

  var shared = new Shared({
    //'swap': path.join(os.tmpdir(), ('__npc-' + process.pid + '.swap')),
   // 'swap': path.join(__dirname, ('.__npc-' + process.pid + '.swap')),
    'swap': path.join(__dirname, ('.__npc.swap')),
  });

  cluster.setupMaster({
    exec: path.join(__dirname, 'worker.js')
  });

  for (var cpuNum = 0; cpuNum < numCPUs; cpuNum += 1){

    var worker = new Worker({
      'shared': shared,
      'onMessage': function(msg){
        //console.log('master #' + process.pid + ' rec\'d message from slave #' + this.process.pid + ':', msg);


        //var msg = new Message();
        //msg.setPayload('ping', Shared.ping.master_message);
        //this.process.send(msg);
      }
    });
    workers.push(worker);

  };

  return {

    setAction: function(id, action, options){
      shared.set(id, action);
    },

    executeAction: function(id, args, options){
      var options = options || {};

      context = options['context'] || this;
      //var meth = shared.get(id);
      //console.log("exec'ing", meth);
      //Shared[id].apply(context, args);

      var workerIndex = ++currentWorker % workers.length;
      var msg = new Message();
      msg.setPayload('action', {
        'id': id,
        'arguments': args || [],
        'options': options || {},
      });
      workers[workerIndex].send(msg);
    }

  };

};

module.exports = Async(); // it's a module!
