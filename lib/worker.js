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
    'parent': process.pid,
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
  var shared = new Shared({
    'swap': process.env.swap
  });

  process.on('message', function(msg){
    var message = msg['payload'];

    switch(message['type']){
      case 'action':

        var cxt = shared || message['arguments'] || this;
        func = shared.get(message['id'])

        ret = func.apply(cxt, message['arguments']);

        if (message.options.promise){
          var msg =  JSON.stringify({
            response: ret,
            promise: message.options.promise,
          });

          process.send(msg);
        }

        break;
      case 'ping':
        // do nothing?
        break;

    }
    if(msg['type'] == 'action'){
    }

  });

} else {
  // our file is loaded in a require(...) statement.
  module.exports = Worker;
}
