

const shortformFuncMatcher = /^\({0,1}[\w]*\){0,1}[\s]*\=\>[\s]*/;
const longformFuncMatcher = /^function\s*\([\w\s,]*\)/;

class Message {

  constructor(payload) {
    this.payload = payload;
  }

  serialize() {
    let inp = this.payload;
    return this.constructor.serialize(inp);
  }

  deserialize(inp) {
    this.payload = this.constructor.deserialize(inp);
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

    let replacer = (key, val) => {
      let type = typeof val;

      switch(type) {
        case 'function':
          return val.toString();

        default:
          return val;
      }

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
      let parsedVal = parsed[id];
      let parsedType = typeof parsedVal;
      let parsedConst = parsedVal.constructor;

      let parsedMatch = parsedVal.match && (
        parsedVal.match(longformFuncMatcher) ||
        parsedVal.match(shortformFuncMatcher)
      );

      if (parsedType == 'string' && parsedMatch) {
        // expand serialized functions in our data.
        let evalStr = 'parsed[id] = ' + parsed[id];
        eval(evalStr);

      } else if (parsedVal && parsedConst == Object) {
        parsed[id] = Message.deserialize(parsed[id]);

      }

    }

    return parsed;
  }

}

module.exports = Message;
