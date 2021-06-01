const assert = require('assert');

module.exports = (options) => {
  const { transport } = options;

  describe('.query()', () => {
    it('should be present', () => {
      assert.ok(transport.query);
      assert.strictEqual('function', typeof transport.query);
    });

    beforeEach(() => {
      transport.log({
        level: 'info',
        message: 'hello world',
      });
    });

    it('should return matching results using basic querying', async () => {
      await transport.query({}, (_, [...logs]) => {
        assert.ok(logs.pop().message.indexOf('hello world') === 0);
      });
    });

    it('should return one result only using the `rows` option', async () => {
      await transport.query({ rows: 1 }, (_, [...logs]) => {
        assert.strictEqual(logs.length, 1);
      });
    });

    it('should return matching results using `fields` and `order` option', async () => {
      await transport.query(
        { order: 'asc', fields: ['timestamp'] },
        (_, [...logs]) => {
          assert.strictEqual(Object.keys(logs[0]).length, 1);
          assert.ok(
            new Date(logs.shift().timestamp) < new Date(logs.pop().timestamp)
          );
        }
      );
    });

    it('should return matching results using the `from` and `until` option', async () => {
      const start = Date.now() - 100 * 1000;
      const end = Date.now() + 100 * 1000;
      await transport.query({ from: start, until: end }, (_, [...logs]) => {
        assert.ok(logs.length >= 1);
      });
    });

    it('should return no results using a bad `from` and `until` option', async () => {
      const now = Date.now() + 1000000;
      await transport.query({ from: now, until: now }, (_, [...logs]) => {
        assert.ok(logs.length === 0);
      });
    });
  });
};
