const Path = require('path');
const Message = require(Path.join(__dirname, '..', 'lib', 'message.js'));


describe('Message', function() {

  describe('the object', function() {
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
      let input;

      beforeEach(function() {
        input = Math.random() * Date.now();
        instance = new Message(input);
      });

      it('contains a user payload', function() {
        expect(instance.payload).toBe(input);
      });

    });

  });


});
