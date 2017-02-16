var fs = require('fs');
var path = require('path');
var os = require('os');

if(!global.__nodeProcessConcurrency){
  global.__nodeProcessConcurrency = {};
}

Shared = function(options){
  var options = options || {};

  var errors = {
    commitMessage: function(err){
      return "[npc:" + process.pid + "]: " +
             "ERROR COMMITTING PROCESS SHARED SPACE PAYLOAD: " + err;
    },
    retrieveMessage: function(err){
      return "[npc:" + process.pid + "]: " +
             "ERROR RETRIEVING PROCESS SHARED SPACE PAYLOAD: " + err;
    },
  }

  var priv = {
    swap: options['swap'],
    //encoding: 'base64',
    encoding: 'ascii',

    payload: {},

    serialize: function(input){
      var output = {};

      for(var key in input){
        if(typeof input[key] == 'function'){
          output[key] = input[key].toString();
        } else {
          output[key] = input[key];
        }
      }

      return JSON.stringify(output, function(key, val){
        if(typeof val == 'function')    return val.toString();

        return val;
      });
    },

    deserialize: function(input){
      var parsed = JSON.parse(input);

      for(var id in parsed){
        if(typeof parsed[id] == 'string' && parsed[id].match(/function\s*\(\)/)){
          // expand serialized functions in our data.
          eval_str = 'parsed[id] = ' + parsed[id];
          eval(eval_str);
        }
      }

      return parsed;
    },

    commit: function(data){
      var payload = priv.serialize(data);
      fs.writeFileSync(priv.swap, payload, priv.encoding);
    },

    retrieve: function(){
      var raw_payload = fs.readFileSync(priv.swap, priv.encoding);
      priv.payload = priv.deserialize(raw_payload);   // ascii decode.

      // likely broken base64 decode...
      //var decoded_payload = new Buffer(raw_payload, 'base64').toString("ascii");
      //priv.payload = priv.deserialize(decoded_payload);
    },

  };

  //priv.retrieve();
  //priv.commit();
  return {
    swap: priv.swap,
    payload: priv.payload,
    encoding: priv.encoding,

    store: function(){
      return fs.readFileSync(priv.swap, priv.encoding);
    },

    get: function(key){
      //console.log('getting ', key);
      priv.retrieve();
      return priv.payload[key];
    },

    set: function(key, val){
      //console.log('setting ', key, 'to', val);
      priv.payload[key] = val;
      priv.commit(priv.payload);

      return val;
    },

  }

};

module.exports = Shared;
