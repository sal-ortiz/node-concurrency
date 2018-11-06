const Path = require('path');
const Cluster = require('cluster');

const Worker = require(Path.join(__dirname, '..', 'lib', 'worker.js'));
const Message = require(Path.join(__dirname, '..', 'lib', 'message.js'));


describe('Worker', () => {

  describe('the object', () => {

    describe('the start static method', () => {

      //describe('given no input', () => {
      //});

      describe('given an input', () => {
        let func;
        let env;
        let result;

        beforeEach(() => {
          flag = false;
          func = (flag) => {
            flag = !flag;
          };
          env = {};

          result = Worker.start(func, env);
        });

        it('spawns and returns a new worker object', () => {
          expect(result.constructor).toBe(Cluster.Worker);
          expect(result.isDead()).toBeFalsy();
        });

        it('spawns a worker that executes on receiving a message', () => {
          expect(result._events.message.includes(func)).toBeTruthy();
        });

      });

//      describe('given no input', () => {
//      });

    });

  });

  describe('an instance of', () => {
    let instance;

    beforeEach(() => {
      instance = new Worker();
    });

    describe('given no input', () => {

      it('has no active promises', () => {
        let num = Object.keys(instance.promises).length;

        expect(num).toBe(0);
      });

      describe('the start method', () => {

        describe('given an input', () => {
          let func;
          let env;
          let expected;
          let result;

          beforeEach(() => {
            func = (flag) => {
              return !flag;
            };
            env = {};
            expected = instance.constructor.start(func, env);

            spyOn(instance.constructor, 'start')
              //.withArgs(func, env)
              .and.returnValue(expected);

            result = instance.start(func, env);
          });

          it('spawns a new worker', () => {
            expect(instance.constructor.start).toHaveBeenCalled()
          });

          it('stores it\' worker process object', () => {
            expect(instance.process).toBe(expected);
            expect(instance.process.constructor).toBe(Cluster.Worker);
          });

          it('stores it\' parent process object', () => {
            expect(instance.parent).toBe(process);
          });

        });

//        describe('given no input', () => {
//        });

      });

      describe('the stop method', () => {

        describe('given no input', () => {
          let func;
          let env;
          let expected;
          let result;

          beforeEach(() => {
            instance.start();
            instance.stop();
          });

          it('kills the current worker', () => {
            expect(instance.process.process.killed).toBeTruthy();
          });

        });

//        describe('given an input', () => {
//        });

      });


      describe('the execute method', () => {

        describe('given an input', () => {
          let input;
          let result;

          beforeEach(() => {
            input = () => {
              return process.pid;
            };

            instance.start();
          });


          it('returns a promise', () => {
            let result = instance.execute(input, []);

            expect(result.constructor).toBe(Promise);
          });

          it('executes the given function in another process', (done) => {
            instance.execute(input, [])
              .then((workerPid) => {
                expect(workerPid).not.toEqual(process.pid);

                done();
              });
          });

          it('sends a message to the worker process', () => {
            spyOn(instance, 'send');
            let result = instance.execute(input, []);

            expect(instance.send).toHaveBeenCalled();
          });

          it('uses the function\'s return to the subsequent promise', (done) => {
            let val = Math.floor(Math.random() * Date.now());
            let func = (val) => {
              return val + 1;
            };

            instance.execute(func, [val])
              .then(function(res) {
                expect(res).toEqual(val + 1);

                done();
              });

          });


          describe('given optional further arguments', () => {
            let arg;

            beforeEach(() => {
              arg = 0;
              input = (arg) => {
                return arg + 1
              };

              instance.start();
              result = instance.execute(input, [arg])
            });

            it('passes the arguments to the given function', (done) => {
              result
                .then((ret) => {
                  expect(ret).toEqual(arg + 1);

                  done();
                });

            });


          });

        });

      });


      describe('the executeTimeout method', () => {

        describe('given an input', () => {
          let input;
          let result;
          let delay = 125;

          beforeEach(() => {
            input = () => {
              return process.pid;
            };

            instance.start();
          });


          it('returns a promise', () => {
            let result = instance.executeTimeout(input, delay, []);

            expect(result.constructor).toBe(Promise);
          });

          it('executes the given function in another process', (done) => {
            instance.executeTimeout(input, delay, [])
              .then((workerPid) => {
                expect(workerPid).not.toEqual(process.pid);

                done();
              });
          });

          it('executes the given function after a delay', (done) => {
            let timestamp = Date.now();

            instance.executeTimeout(input, delay, [])
              .then((workerPid) => {
                expect(Date.now()).toBeGreaterThan(timestamp + delay);

                done();
              });
          });

          it('sends a message to the worker process', () => {
            spyOn(instance, 'send');
            let result = instance.executeTimeout(input, delay, []);

            expect(instance.send).toHaveBeenCalled();
          });

          it('uses the function\'s return to the subsequent promise', (done) => {
            let val = Math.floor(Math.random() * Date.now());
            let func = (val) => {
              return val + 1;
            };

            instance.executeTimeout(func, delay, [val])
              .then(function(res) {
                expect(res).toEqual(val + 1);

                done();
              });

          });


          describe('given optional further arguments', () => {
            let arg;

            beforeEach(() => {
              arg = 0;
              input = (arg) => {
                return arg + 1
              };

              instance.start();
              result = instance.executeTimeout(input, delay, [arg])
            });

            it('passes the arguments to the given function', (done) => {
              result
                .then((ret) => {
                  expect(ret).toEqual(arg + 1);

                  done();
                });

            });


          });

        });

      });

    });

    //describe('given an input', () => {
    //});

  });

});
