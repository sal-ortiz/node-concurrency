const Path = require('path');
const Master = require(Path.join(__dirname, '..', 'lib', 'master.js'));


const DEP_STUB_PATH = Path.join(__dirname, 'support', 'dependency_stub.js');
const DependencyStub = require(DEP_STUB_PATH);


describe('Master', () => {

//  describe('the object', () => {
//  });

  describe('an instance of', () => {
    let instance;

    describe('given no input', () => {

      beforeEach(() => {
        instance = new Master();

        instance.startWorker();
      });

      afterEach(() => {
        instance.stopWorker();
      });


      it('has no active workers', () => {
        let instance = new Master();

        expect(instance.workers.length).toBe(0);
      });

      describe('the startWorker method', () => {

        //describe('given an input', () => {
        //});

        describe('given no input', () => {

          it('starts a single worker', () => {
            expect(instance.workers.length).toEqual(1);
          });

        });

      });

      describe('the stopWorker method', () => {

        //describe('given an input', () => {
        //});

        describe('given no input', () => {

          it('stops a single worker', () => {
            let worker = instance.workers[0];

            expect(instance.workers.length).toEqual(1);
            expect(worker.process.process.killed).toBeFalsy();

            instance.stopWorker();

            expect(instance.workers.length).toEqual(0);
            expect(worker.process.process.killed).toBeTruthy();
          });

        });

      });

      describe('the execute method', () => {
        let input;
        let flag;

        beforeEach(() => {
          flag = false;
          input = (flag) => {
            return !flag;
          };

        });

        it('returns a Promise object', () => {
          let result = instance.execute(input, flag);

          expect(result.constructor).toBe(Promise);
        });

        it('calls the given function input with the following args', (done) => {
          // NOTE: our serialization isn't friendly to
          // Jasmine Spy objects so we test by passing
          // a canary through the pipeline.
          instance.execute(input, flag)
            .then((flag) => {
              expect(flag).toBeTruthy();

              done();
            });
        });

        it('calls the input function in another process', (done) => {
          let masterPid = process.pid;
          let input = () => {
            return process.pid;
          };

          instance.execute(input)
            .then((workerPid) => {
              expect(masterPid).not.toEqual(workerPid);

              done();
            });

        });

        it('exposes dependencies to input function\'s scope', (done) => {
          let instance = new Master();
          let input = (val) => {
            let obj = this['DepStub'];

            return obj.increment(val);
          };

          instance.setDependency('DepStub', DEP_STUB_PATH);
          instance.execute(input, 0)
            .then((res) => {
              expect(res).toEqual(1);

              done();
            });

        });

      });

      describe('the executeTimeout method', () => {
        let input;
        let flag;
        let delay = 125;

        beforeEach(() => {
          flag = false;
          input = (flag) => {
            return !flag;
          }

        });

        it('returns a Promise object', () => {
          let result = instance.executeTimeout(input, delay, flag);

          expect(result.constructor).toBe(Promise);
        });

        it('calls the given function input with the following args', (done) => {
          // NOTE: our serialization isn't friendly to
          // Jasmine Spy objects so we test by passing
          // a canary through the pipeline.
          instance.executeTimeout(input, delay, flag)
            .then((flag) => {
              expect(flag).toBeTruthy();

              done();
            });
        });

        it('calls the input function in another process', (done) => {
          let masterPid = process.pid;
          let input = () => {
            return process.pid;
          };

          instance.executeTimeout(input, delay)
            .then((workerPid) => {
              expect(masterPid).not.toEqual(workerPid);

              done();
            });

        });

        it('calls the input function after the given delay', (done) => {
          let input = () => {
            return Date.now();
          };

          let timestamp = Date.now();
          instance.executeTimeout(input, delay)
            .then((execTimestamp) => {
              expect(execTimestamp).toBeGreaterThan(timestamp + delay);

              done();
            });

        });

      });

      describe('the setDependency method', () => {
        let id = 'Path';
        let path = 'path';
        let before;


        it('adds the given id and path to the list of dependencies', () => {

          let beforeLen = Object.keys(instance.requires).length;

          instance.setDependency(id, path);

          let afterLen = Object.keys(instance.requires).length;

          expect(afterLen).toBeGreaterThan(beforeLen);
        });

      });

    });

    //describe('given an input', () => {
    //});

  });

});
