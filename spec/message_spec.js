const Path = require('path');
const Message = require(Path.join(__dirname, '..', 'lib', 'message.js'));


describe('Message', function() {

  describe('the object', function() {

    describe('the serialize static function', function() {
      let input = {};
      let result;

      beforeEach(function() {
        result = Message.serialize(input);
      });


      it('returns a string', function() {
        expect(result.constructor).toBe(String);
      });


      it('returns output matching it\s input', function() {
        let deserialized = JSON.parse(result);
        expect(deserialized).toEqual(input);
      });

    });

    describe('the deserialize static function', function() {
      let input = JSON.stringify({});
      let result;

      beforeEach(function() {
        result = Message.deserialize(input);
      });


      it('returns the same type as it\'s input', function() {
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

  describe('an instance of', function() {
    let instance;

    describe('given no input', function() {

      beforeEach(function() {
        instance = new Message();
      });

      it('contains an empty payload', function() {
        expect(instance.payload).toBeUndefined();
      });

    });

    describe('given an input', function() {
      let input = {};

      beforeEach(function() {
        instance = new Message(input);
      });

      it('contains a user payload', function() {
        expect(instance.payload).toBe(input);
      });

      describe('the serialize function', function() {
        let result;

        beforeEach(function() {
          spyOn(instance.constructor, 'serialize')
            .withArgs(instance.payload);

          result = instance.serialize();
        });

        it('returns our payload as a string', function() {
          expect(instance.constructor.serialize)
            .toHaveBeenCalledWith(instance.payload);
        });


      });

      describe('the deserialize function', function() {
        let input = {};

        beforeEach(function() {
          serialized = JSON.stringify(input);

          spyOn(instance.constructor, 'deserialize')
            .withArgs(serialized)
            .and.returnValue(input);

          instance.deserialize(serialized);
        });

        it('parses the input', function() {
          expect(instance.constructor.deserialize)
            .toHaveBeenCalledWith(serialized);
        });

        it('updates it\'s own payload', function() {
          expect(instance.payload).toEqual(input);
        });

      });

    });

  });


});
