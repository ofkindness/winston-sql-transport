const assert = require('assert');

module.exports = (options) => {
  const { construct, name, Transport } = options;
  let instance;

  beforeEach(() => {
    const create = typeof construct === 'function' ? construct() : construct;

    instance = new Transport(create);

    describe('query', () => {
      assert(name);
      assert(instance);
      // 'the query() method': {
      //     'using basic querying': {
      //       topic: function topic() {
      //         if (!transport.query) return;
      //         const cb = this.callback;
      //         logger.log('info', 'hello world', {}, () => logger.query(cb));
      //       },
      //       'should return matching results': (err, results) => {
      //         if (!transport.query) return;
      //         assert.isNull(err);
      //         const [...logs] = results.SQLTransport;
      //         const log = logs.pop();
      //         assert.ok(log.message.indexOf('hello world') === 0 ||
      //           log.message.indexOf('test message') === 0);
      //       }
      //     },
      //     'using the `rows` option': {
      //       topic: function topic() {
      //         if (!transport.query) return;
      //         const cb = this.callback;
      //         logger.log('info', 'hello world', {}, () => {
      //           logger.query({ rows: 1 }, cb);
      //         });
      //       },
      //       'should return one result': (err, results) => {
      //         if (!transport.query) return;
      //         assert.isNull(err);
      //         const [...logs] = results.SQLTransport;
      //         assert.equal(logs.length, 1);
      //       }
      //     },
      //     'using `fields` and `order` option': {
      //       topic: function topic() {
      //         if (!transport.query) return;
      //         const cb = this.callback;
      //         logger.log('info', 'hello world', {}, () => {
      //           logger.query({ order: 'asc', fields: ['timestamp'] }, cb);
      //         });
      //       },
      //       'should return matching results': (err, results) => {
      //         if (!transport.query) return;
      //         assert.isNull(err);
      //         const [...logs] = results.SQLTransport;
      //         assert.equal(Object.keys(logs[0]).length, 1);
      //         assert.ok(new Date(logs.shift().timestamp) <
      //           new Date(logs.pop().timestamp));
      //       }
      //     },
      //     'using the `from` and `until` option': {
      //       topic: function topic() {
      //         if (!transport.query) return;
      //         const cb = this.callback;
      //         const start = Date.now() - (100 * 1000);
      //         const end = Date.now() + (100 * 1000);
      //         logger.query({ from: start, until: end }, cb);
      //       },
      //       'should return matching results': (err, results) => {
      //         if (!transport.query) return;
      //         assert.isNull(err);
      //         const [...logs] = results.SQLTransport;
      //         assert.ok(logs.length >= 1);
      //       }
      //     },
      //     'using a bad `from` and `until` option': {
      //       topic: function topic() {
      //         if (!transport.query) return;
      //         const cb = this.callback;
      //         logger.log('info', 'bad from and until', {}, () => {
      //           const now = Date.now() + 1000000;
      //           logger.query({ from: now, until: now }, cb);
      //         });
      //       },
      //       'should return no results': (err, results) => {
      //         if (!transport.query) return;
      //         assert.isNull(err);
      //         const [...logs] = results.SQLTransport;
      //         assert.isUndefined([logs.filter(log => log.message === 'bad from and until').pop()][0]);
      //       }
      //     }
      //   }
    });
  });
};
