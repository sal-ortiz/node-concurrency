var cluster = require("cluster");
var path = require("path");
var Message = require(path.join(__dirname, 'message'));
var Shared = require(path.join(__dirname, 'shared'));


var Worker = function(options){
  // The runtime context, from here, is from within the master process.

  var options = options || {};
  var priv = {
    onMessageHandler: options['onMessage'],
  };

  var attributes = {};
  var env = {
    'swap': options['shared']['swap'],
  };
  attributes['process'] = cluster.fork(env);
  attributes['process'].on('message', priv.onMessageHandler);

  return Object.assign(attributes, {

    send: function(msg){
      this.process.send(msg); // send to our worker process
    },

  });

};


// The runtime context, from here, is from within a worker process..
if(require.main === module){
  // our file was called directly rather than req'd.
  //console.log('worker #' + process.pid, 'loaded!');
  var shared = new Shared({
    'swap': process.env.swap
  });

  process.on('message', function(msg){
    var message = msg['payload'];
    //console.log('worker #' + process.pid, 'rec\'d message from master:', msg);
    switch(message['type']){
      case 'action':
        //console.log('running action:', message['id']);

        var cxt = shared || message['arguments'] || this;
        shared.get(message['id']).apply(cxt, message['arguments']);
        break;
      case 'ping':
        // do nothing?
        break;

    }
    if(msg['type'] == 'action'){
    }

  });

  //var msg = new Message();
  //msg.setPayload('ping', Shared.ping.worker_message);
  //process.send(msg);
} else {
  // our file is loaded in a require(...) statement.
  module.exports = Worker;
}
