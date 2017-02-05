


module.exports = function(options){
  var Constants = require('./constants.js')['message'];
  var options = options || {};

  var attributes = {
    'sender': options['from'] || [],
    //'recipient': options['to'] || [],
    'payload': undefined,
    'createdTimestamp': new Date().toISOString(),
    'sentTimestamp': undefined,
    'receivedTimestamp': undefined,
  };

  return Object.assign(attributes, {

    setSender: function(id){
      this.sender = id;
    },

    setPayload: function(type, data){

      var args = [];
      if(typeof data == 'object'){
        for(key in data){
          args.push(data[key]);
        }
      } else {
        args.push(data);
      }

      this.payload = Constants.payloads[type].apply(this, args);
    },

    setCreated: function(timestamp){
      this.createdTimestamp = timestamp || new Date().toISOString();
    },

    setSent: function(timestamp){
      this.sentTimestamp = timestamp || new Date().toISOString();
    },

    setReceived: function(timestamp){
      this.receivedTimestamp = timestamp || new Date().toISOString();
    },

  });

};
