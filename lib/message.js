
class Message {

  constructor(payload) {
    this.payload = payload;
  }

  serialize() {
    return this.constructor.serialize(this.payload);
  }

  deserialize(input) {
    this.payload = this.constructor.deserialize(input);
  }

  static serialize(input) {
    let output = {};

    for (let key in input) {
      if (typeof input[key] == 'function') {
        output[key] = input[key].toString();
      } else {
        output[key] = input[key];
      }
    }

    let replacer = function(key, val) {
      if (typeof val == 'function') {
        return val.toString();
      }

      return val;

    };

    return JSON.stringify(output, replacer);

  }

  static deserialize(input) {
    let parsed;
    if (input.constructor == String) {
      parsed = JSON.parse(input);
    } else {
      parsed = input;
    }

    for (let id in parsed) {
      if (typeof parsed[id] == 'string' && parsed[id].match(/function\s*\([\w\s,]*\)/)) {
        // expand serialized functions in our data.
        let evalStr = 'parsed[id] = ' + parsed[id];
        eval(evalStr);
      } else if (parsed[id] && parsed[id].constructor == Object) {
        parsed[id] = this.deserialize(parsed[id]);
      }
    }

    return parsed;
  }

}

module.exports = Message;
