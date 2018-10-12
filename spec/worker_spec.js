const Path = require('path');
const Cluster = require('cluster');

const Worker = require(Path.join(__dirname, '..', 'lib', 'worker.js'));
const Message = require(Path.join(__dirname, '..', 'lib', 'message.js'));


describe('Worker', function() {

  describe('the object', function() {

    describe('the start static method', function() {

      //describe('given no input', function() {
      //});

      describe('given an input', function() {
        let func;
        let env;
        let result;

        beforeEach(function() {
          flag = false;
          func = function(flag) {
            flag = !flag;
          };
          env = {};

          result = Worker.start(func, env);
        });

        it('spawns and returns a new worker object', function() {
          expect(result.constructor).toBe(Cluster.Worker);
          expect(result.isDead()).toBeFalsy();
        });

        it('spawns a worker that executes on receiving a message', function() {
          expect(result._events.message.includes(func)).toBeTruthy();
        });

      });

//      describe('given no input', function() {
//      });

    });

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

      describe('the start method', function() {

        describe('given an input', function() {
          let func;
          let env;
          let expected;
          let result;

          beforeEach(function() {
            func = function(flag) {
              return !flag;
            };
            env = {};
            expected = instance.constructor.start(func, env);

            spyOn(instance.constructor, 'start')
              //.withArgs(func, env)
              .and.returnValue(expected);

            result = instance.start(func, env);
          });

          it('spawns a new worker', function() {
            expect(instance.constructor.start).toHaveBeenCalled()
          });

          it('stores it\' worker process object', function() {
            expect(instance.process).toBe(expected);
            expect(instance.process.constructor).toBe(Cluster.Worker);
          });

          it('stores it\' parent process object', function() {
            expect(instance.parent).toBe(process);
          });



        });

//        describe('given no input', function() {
//        });


      });

      describe('the execute method', function() {

        describe('given an input', function() {
          let input;
          let result;

          beforeEach(function() {
            input = function() {
              return process.pid;
            };

            instance.start();
          });


          it('returns a promise', function() {
            let result = instance.execute(input, []);

            expect(result.constructor).toBe(Promise);
          });

          it('executes the given function in another process', function(done) {
            instance.execute(input, [])
              .then(function(workerPid) {
                expect(workerPid).not.toEqual(process.pid);

                done();
              });
          });

          it('sends a message to the worker process', function() {
            spyOn(instance, 'send');
            let result = instance.execute(input, []);

            expect(instance.send).toHaveBeenCalled();
          });

          describe('given optional further arguments', function() {
            let arg;

            beforeEach(function() {
              arg = 0;
              input = function(arg) {
                return arg + 1
              };

              instance.start();
              result = instance.execute(input, [arg])
            });

            it('passes the arguments to the given function', function(done) {
              result
                .then(function(ret) {
                  expect(ret).toEqual(arg + 1);

                  done();
                });

            });


          });

        });

      });

    });

    //describe('given an input', function() {
    //});

  });

});
