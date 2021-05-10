const assert = require('assert');

module.exports = (options) => {
  const { transport } = options;

  describe('.stream()', () => {
    it('should be present', () => {
      assert.ok(transport.stream);
      assert.strictEqual('function', typeof transport.stream);
    });

    beforeEach(() => {
      transport.log({
        level: 'info',
        message: 'hello world',
      });
    });
  });
};
// 'the stream() method': {
//     'using no options': {
//       topic: function topic() {
//         if (!transport.stream) return;

//         logger.log('info', 'hello world', {});

//         const cb = this.callback;
//         let j = 10;
//         let i = 10;
//         const results = [];
//         const stream = logger.stream();

//         stream.on('log', (log) => {
//           results.push(log);
//           results.stream = stream;
//           j -= 1;
//           if (j === 0) {
//             cb(null, results);
//           }
//         });

//         stream.on('error', (err) => {
//           j = -1; // don't call the callback again
//           cb(err);
//         });
//         while (i) {
//           i -= 1;
//           logger.log('info', `hello world ${i}`, {});
//         }
//       },
//       'should stream logs': (err, results) => {
//         if (!transport.stream) return;
//         assert.isNull(err);
//         results.forEach((log) => {
//           assert.ok(log.message.indexOf('hello world') === 0 ||
//             log.message.indexOf('test message') === 0);
//         });
//         results.stream.destroy();
//       }
//     },
//     'using the `start` option': {
//       topic: function topic() {
//         if (!transport.stream) return;

//         let cb = this.callback;
//         const stream = logger.stream({ start: 0 });

//         stream.on('log', (log) => {
//           Object.assign(log, { stream });
//           if (cb) cb(null, log);
//           cb = null;
//         });
//       },
//       'should stream logs': (err, log) => {
//         if (!transport.stream) return;
//         assert.isNull(err);
//         assert.isNotNull(log.message);
//         log.stream.destroy();
//       }
//     }
//   },
