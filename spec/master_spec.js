const Path = require('path');
const Master = require(Path.join(__dirname, '..', 'lib', 'master.js'));


describe('Master', () => {

//  describe('the object', () => {
//  });


  describe('an instance of', () => {
    let instance;

    describe('given no input', () => {

      beforeEach(() => {
        instance = new Master();
      });

      it('has no active workers', () => {
        expect(instance.workers.length).toBe(0);
      });

      describe('the startWorker method', () => {

        //describe('given an input', () => {
        //});

        describe('given no input', () => {

          beforeEach(() => {
            instance.startWorker();
          });

          it('starts a single worker', () => {
            expect(instance.workers.length).toEqual(1);
          });

        });

      });

      describe('the stopWorker method', () => {

        //describe('given an input', () => {
        //});

        describe('given no input', () => {

          beforeEach(() => {
            instance.startWorker();
          });

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
          }

          // need a worker to execute stuff.
          instance.startWorker();
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

      });

    });

    //describe('given an input', () => {
    //});

  });

});
