var fs = require('fs');
var path = require('path');
var os = require('os');

if(!global.__nodeProcessConcurrency){
  global.__nodeProcessConcurrency = {};
}

Shared = function(options){
  var options = options || {};

  var priv = {
    swap: options['swap'],
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
      payload = priv.deserialize(raw_payload);   // ascii decode.

      // likely broken base64 decode...
      //var decoded_payload = new Buffer(raw_payload, 'base64').toString("ascii");
      //this.payload = priv.deserialize(decoded_payload);

      return payload;
    },

  };

  if ( !fs.existsSync(priv.swap) ){ priv.commit(); }

  return {
    swap: priv.swap,
    payload: {},
    encoding: priv.encoding,

    get: function(key){
      this.payload = priv.retrieve();
      return this.payload[key];
    },

    set: function(key, val){
      this.payload = priv.retrieve();

      this.payload[key] = val;
      priv.commit(this.payload);

      return val;
    },

  }

};

module.exports = Shared;
