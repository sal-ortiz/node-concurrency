const Path = require('path');
const Message = require(Path.join(__dirname, '..', 'lib', 'message.js'));


describe('Message', () => {

  describe('the object', () => {

    describe('the serialize static function', () => {
      let input = {};
      let result;

      beforeEach(() => {
        result = Message.serialize(input);
      });

      it('returns a string', () => {
        expect(result.constructor).toBe(String);
      });

      it('returns output matching it\s input', () => {
        let deserialized = JSON.parse(result);
        expect(deserialized).toEqual(input);
      });

    });

    describe('the deserialize static function', () => {
      let input = JSON.stringify({});
      let result;

      beforeEach(() => {
        result = Message.deserialize(input);
      });


      it('returns the same type as it\'s input', () => {
        let deserialized = JSON.parse(input);
        expect(result.constructor).toBe(deserialized.constructor);
      });

      it('returns output matching it\s input', () => {
        let reserialized = JSON.stringify(result);
        expect(reserialized).toEqual(input);
      });

      it('successfully parses longform function declaratitons', () => {
        let input = { func: function(val) {} };
        let serialized = Message.serialize(input);

        let result = Message.deserialize(serialized);
        expect(result.func.toString()).toEqual(input.func.toString());
      });

      it('successfully parses shortform function declaratitons', () => {
        let input = { func: (val) => {} };
        let serialized = Message.serialize(input);

        let result = Message.deserialize(serialized);
        expect(result.func.toString()).toEqual(input.func.toString());
      });

      it('successfully parses optional shortform function syntax', () => {
        // parantheses are optional in shortfom syntax.
        let input = { func: val => {} };
        let serialized = Message.serialize(input);

        let result = Message.deserialize(serialized);
        expect(result.func.toString()).toEqual(input.func.toString());
      });

      it('successfully parses objects', () => {
        // parantheses are optional in shortfom syntax.
        let input = { obj: { val: 1 } };
        let serialized = Message.serialize(input);

        let result = Message.deserialize(serialized);
        expect(JSON.stringify(result.obj)).toEqual(JSON.stringify(input.obj));
      });

      it('successfully parses arrays', () => {
        // parantheses are optional in shortfom syntax.
        let input = { ary: [10,11,12,13,14] };
        let serialized = Message.serialize(input);

        let result = Message.deserialize(serialized);
        expect(JSON.stringify(result.ary)).toEqual(JSON.stringify(input.ary));
      });

      it('successfully parses numbers', () => {
        // parantheses are optional in shortfom syntax.
        let input = { num: 1 };
        let serialized = Message.serialize(input);

        let result = Message.deserialize(serialized);
        expect(result.num).toEqual(input.num);
      });

      it('successfully parses single-quoted strings', () => {
        // parantheses are optional in shortfom syntax.
        let input = { str: 'hello!' };
        let serialized = Message.serialize(input);

        let result = Message.deserialize(serialized);
        expect(result.str).toEqual(input.str);
      });

      it('successfully parses double-quoted strings', () => {
        // parantheses are optional in shortfom syntax.
        let input = { str: "hello!" };
        let serialized = Message.serialize(input);

        let result = Message.deserialize(serialized);
        expect(result.str).toEqual(input.str);
      });

    });

  });

  describe('an instance of', () => {
    let instance;

    describe('given no input', () => {

      beforeEach(() => {
        instance = new Message();
      });

      it('contains an empty payload', () => {
        expect(instance.payload).toBeUndefined();
      });

    });

    describe('given an input', () => {
      let input = {};

      beforeEach(() => {
        instance = new Message(input);
      });

      it('contains a user payload', () => {
        expect(instance.payload).toBe(input);
      });

      describe('the serialize function', () => {
        let result;

        beforeEach(() => {
          spyOn(instance.constructor, 'serialize')
            .withArgs(instance.payload);

          result = instance.serialize();
        });

        it('returns our payload as a string', () => {
          expect(instance.constructor.serialize)
            .toHaveBeenCalledWith(instance.payload);
        });


      });

      describe('the deserialize function', () => {
        let input = {};

        beforeEach(() => {
          serialized = JSON.stringify(input);

          spyOn(instance.constructor, 'deserialize')
            .withArgs(serialized)
            .and.returnValue(input);

          instance.deserialize(serialized);
        });

        it('parses the input', () => {
          expect(instance.constructor.deserialize)
            .toHaveBeenCalledWith(serialized);
        });

        it('updates it\'s own payload', () => {
          expect(instance.payload).toEqual(input);
        });

      });

    });

  });


});
