const Path = require('path');
const Balancer = require(Path.join(__dirname, '..', 'lib', 'balancer.js'));


describe('Balancer', () => {

  describe('the Round Robin balancer', () => {

    describe('an instance of', () => {
      let instance;

      describe('given an input', () => {
        let input;
        let base;

        beforeEach(() => {
          base = Object;  // TODO: maybe we should use stubbed Workers?
          input = [new base(), new base()];
          instance = new Balancer.RoundRobin(input);
        });

        describe('the next function', () => {

          //describe('given an input', () => {
          //});

          describe('given no input', () => {
            let result;

            beforeEach(() => {
              result = instance.next();
            });

            it('returns an element from our input array', () => {
              expect(result.constructor).toBe(base);
            });

            it('advances it\'s index', () => {
              let startIndex = instance.index;
              instance.next();

              expect(instance.index).toEqual(startIndex + 1);
            });

            it('cycles forward through the end of our array', () => {
              // our interator always starts from 0 if our first call
              // made was to next(), rather than prev().
              let startIndex = instance.index;
              instance.next();
              instance.next();

              expect(instance.index).toEqual(startIndex);
            });

          });

        });

        describe('the prev function', () => {

          //describe('given an input', () => {
          //});

          describe('given no input', () => {
            let result;

            beforeEach(() => {
              result = instance.prev();
            });

            it('returns an item from our input array', () => {
              expect(result.constructor).toBe(base);
            });

            it('retracts it\'s index', () => {
              let startIndex = instance.index;
              instance.prev();

              expect(instance.index).toEqual(
                (startIndex || input.length) - 1
              );

            });

            it('cycles back through the start of our array', () => {
              // our interator always starts from the end if our first call
              // made was to prev(), rather than next().
              instance.prev();
              instance.prev();

              expect(instance.index).toEqual(instance.workers.length - 1);
            });

          });

        });

      });

      //describe('given an input', () => {
      //});

    });

  });

});
