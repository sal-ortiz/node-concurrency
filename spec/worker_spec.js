const Path = require('path');
const Worker = require(Path.join(__dirname, '..', 'lib', 'worker.js'));


describe('Worker', function() {

  describe('the object', function() {
  });

  describe('an instance of', function() {
    let instance;

    beforeEach(function() {
      instance = new Worker();
    });

    describe('given no input', function() {

      it('has no active promises', function() {
        let num = Object.keys(instance.promises).length;

        expect(num).toBe(0);
      });

      it('knows it\'s parent process', function() {
        expect(instance.parent).toBe(process);
      });

    });

    //describe('given an input', function() {
    //});

  });

});
