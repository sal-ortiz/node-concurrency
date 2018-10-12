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

      describe('the startWorker method', function() {

        //describe('given an input', function() {
        //});

        describe('given no input', function() {

          beforeEach(function() {
            instance.startWorker();
          });

          it('starts a single worker', function() {
            expect(instance.workers.length).toEqual(1);
          });

        });

      });

      describe('the execute method', function() {
        let input;
        let flag;

        beforeEach(function() {
          flag = false;
          input = function(flag) {
            return !flag;
          }

          // need a worker to execute stuff.
          instance.startWorker();
        });

        it('returns a Promise object', function() {
          let result = instance.execute(input, flag);

          expect(result.constructor).toBe(Promise);
        });

        it('calls the given function input with the following args', function(done) {
          // NOTE: our serialization isn't friendly to
          // Jasmine Spy objects so we test by passing
          // a canary through the pipeline.
          instance.execute(input, flag)
            .then(function(flag) {
              expect(flag).toBeTruthy();

              done();
            });
        });

        it('calls the input function in another process', function(done) {
          let masterPid = process.pid;
          let input = function() {
            return process.pid;
          };

          instance.execute(input)
            .then(function(workerPid) {
              expect(masterPid).not.toEqual(workerPid);

              done();
            });

        });

      });

    });

    //describe('given an input', function() {
    //});

  });

});
