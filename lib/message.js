
class Message {

  constructor(payload) {
    this.payload = payload;
  }

  serialize() {
    return this.constructor.serialize(this.payload);
  }

  deserialize() {
    return this.constructor.deserialize(this.payload);
  }

  static serialize(input) {
    var output = {};

    for (var key in input) {
      if (typeof input[key] == 'function') {
        output[key] = input[key].toString();
      } else {
        output[key] = input[key];
      }
    }

    return JSON.stringify(output, function(key, val) {
      if (typeof val == 'function')    return val.toString();

      return val;
    });
  }

  static deserialize(input) {
    var parsed;
    if (input.constructor == String) {
      parsed = JSON.parse(input);
    } else {
      parsed = input;
    }

    for (var id in parsed) {
      if (typeof parsed[id] == 'string' && parsed[id].match(/function\s*\([\w\s,]*\)/)) {
        // expand serialized functions in our data.
        var evalStr = 'parsed[id] = ' + parsed[id];
        eval(evalStr);
      } else if (parsed[id] && parsed[id].constructor == Object) {
        parsed[id] = this.deserialize(parsed[id]);
      }
    }

    return parsed;
  }

}

module.exports = Message;
