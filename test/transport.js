/* eslint no-param-reassign: 0 */
/* eslint no-plusplus: 0 */
const assert = require('assert');
const helpers = require('./../node_modules/winston/test/helpers');

module.exports = (logger, transport) => ({
  topic: logger,
  'when passed valid options': {
    'should have the proper methods defined': () => {
      assert.isFunction(transport.log);
    }
  },
  'the log() method': helpers.testNpmLevels(transport,
    'should respond with true', (ign, err, logged) => {
      assert.isNull(err);
      assert.isNotNull(logged);
    }
  ),
  'the stream() method': {
    'using no options': {
      topic: function topic() {
        if (!transport.stream) return;

        logger.log('info', 'hello world', {});

        const cb = this.callback;
        let j = 10;
        let i = 10;
        const results = [];
        const stream = logger.stream();

        stream.on('log', (log) => {
          results.push(log);
          results.stream = stream;
          if (!--j) cb(null, results);
        });

        stream.on('error', (err) => {
          j = -1; // don't call the callback again
          cb(err);
        });

        while (i--) {
          logger.log('info', `hello world ${i}`, {});
        }
      },
      'should stream logs': (err, results) => {
        if (!transport.stream) return;
        assert.isNull(err);
        results.forEach((log) => {
          assert.ok(log.message.indexOf('hello world') === 0 ||
            log.message.indexOf('test message') === 0);
        });
        results.stream.destroy();
      }
    },
    'using the `start` option': {
      topic: function topic() {
        if (!transport.stream) return;

        let cb = this.callback;
        const stream = logger.stream({ start: 0 });

        stream.on('log', (log) => {
          log.stream = stream;
          if (cb) cb(null, log);
          cb = null;
        });
      },
      'should stream logs': (err, log) => {
        if (!transport.stream) return;
        assert.isNull(err);
        assert.isNotNull(log.message);
        log.stream.destroy();
      }
    }
  },
  'after the logs have flushed': {
    topic: function topic() {
      setTimeout(this.callback, 2000);
    },
    'the query() method': {
      'using basic querying': {
        topic: function topic() {
          if (!transport.query) return;
          const cb = this.callback;
          logger.log('info', 'hello world', {}, () => {
            logger.query(cb);
          });
        },
        'should return matching results': (err, results) => {
          if (!transport.query) return;
          assert.isNull(err);
          results = results[transport.name];
          while (!Array.isArray(results)) {
            results = results[Object.keys(results).pop()];
          }
          const log = results.pop();
          assert.ok(log.message.indexOf('hello world') === 0 ||
            log.message.indexOf('test message') === 0);
        }
      },
      'using the `rows` option': {
        topic: function topic() {
          if (!transport.query) return;
          const cb = this.callback;
          logger.log('info', 'hello world', {}, () => {
            logger.query({ rows: 1 }, cb);
          });
        },
        'should return one result': (err, results) => {
          if (!transport.query) return;
          assert.isNull(err);
          results = results[transport.name];
          while (!Array.isArray(results)) {
            results = results[Object.keys(results).pop()];
          }
          assert.equal(results.length, 1);
        }
      },
      'using `fields` and `order` option': {
        topic: function topic() {
          if (!transport.query) return;
          const cb = this.callback;
          logger.log('info', 'hello world', {}, () => {
            logger.query({ order: 'asc', fields: ['timestamp'] }, cb);
          });
        },
        'should return matching results': (err, results) => {
          if (!transport.query) return;
          assert.isNull(err);
          results = results[transport.name];
          while (!Array.isArray(results)) {
            results = results[Object.keys(results).pop()];
          }
          assert.equal(Object.keys(results[0]).length, 1);
          assert.ok(new Date(results.shift().timestamp) <
            new Date(results.pop().timestamp));
        }
      },
      'using the `from` and `until` option': {
        topic: function topic() {
          if (!transport.query) return;
          const cb = this.callback;
          const start = Date.now() - (100 * 1000);
          const end = Date.now() + (100 * 1000);
          logger.query({ from: start, until: end }, cb);
        },
        'should return matching results': (err, results) => {
          if (!transport.query) return;
          assert.isNull(err);
          results = results[transport.name];
          while (!Array.isArray(results)) {
            results = results[Object.keys(results).pop()];
          }
          assert.ok(results.length >= 1);
        }
      },
      'using a bad `from` and `until` option': {
        topic: function topic() {
          if (!transport.query) return;
          const cb = this.callback;
          logger.log('info', 'bad from and until', {}, () => {
            const now = Date.now() + 1000000;
            logger.query({ from: now, until: now }, cb);
          });
        },
        'should return no results': (err, results) => {
          if (!transport.query) return;
          assert.isNull(err);
          results = results[transport.name];
          while (!Array.isArray(results)) {
            results = results[Object.keys(results).pop()];
          }
          results = [results.filter(log => log.message === 'bad from and until').pop()];
          assert.isUndefined(results[0]);
        }
      }
    }
  },
  'the pool': {
    'should be destroyed': () => {
      setTimeout(() => {
        transport.client.destroy();
      }, 3000);
    }
  }
});
