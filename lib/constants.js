

module.exports = function(){
  var attributes = {};

  return Object.assign(attributes, {

    message: {
      payloadTypes: [ 'ping',     // heartbeat ping.
                      'action',   // execute an action.
                    ],

      payloads: {
        ping: function(msg){
          return {
            'type': 'ping',
            'message': msg,
          };
        },

        action: function(id, args, options){
          return {
            'type': 'action',
            'id': id,
            'arguments': args,
            'options': options,
          }
        },

      }

    },

  });


}();  // it's a module!
