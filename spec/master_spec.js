const Path = require('path');
const Master = require(Path.join(__dirname, '..', 'lib', 'master.js'));


describe('Master', function() {

//  describe('the object', function() {
//  });


  describe('an instance of', function() {
    let instance;

    describe('given no input', function() {

      beforeEach(function() {
        instance = new Master();
      });

      it('has no active workers', function() {
        expect(instance.workers.length).toBe(0);
        expect(instance.currentWorker).toBeLessThan(1);
      });

    });

    //describe('given an input', function() {
    //});


  });



});
