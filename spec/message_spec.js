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

      it('returns output matching it\s input', function() {
        let serialized = JSON.stringify(result);
        expect(serialized).toEqual(input);
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
