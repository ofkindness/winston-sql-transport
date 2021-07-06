/**
 * @module 'winston-sql-transport'
 * @fileoverview Winston universal SQL transport for logging
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */
const knex = require('knex');
const moment = require('moment');
const Transport = require('winston-transport');
const { callbackify } = require('util');

const { handleCallback } = require('./helpers');

class SQLTransport extends Transport {
  /**
   * Constructor for the universal transport object.
   * @constructor
   * @param {Object} options
   * @param {string} options.client - Database client
   * @param {string} options.connectionString - Database connection uri
   * @param {string} [options.label] - Label stored with entry object if defined.
   * @param {string} [options.level=info] - Level of messages that this transport
   * should log.
   * @param {string} [options.name] - Transport instance identifier. Useful if you
   * need to create multiple universal transports.
   * @param {boolean} [options.silent=false] - Boolean flag indicating whether to
   * suppress output.
   * @param {string} [options.tableName=winston_logs] - The name of the table you
   * want to store log messages in.
   */
  constructor(options = {}) {
    super();

    const {
      client,
      connection = {},
      label = '',
      level = 'info',
      meta = {},
      name = 'SQLTransport',
      silent = false,
      tableName = 'winston_logs',
    } = options;

    if (!client) {
      throw new Error('You have to define client');
    }

    Object.assign(this, {
      client: knex({
        client,
        connection,
      }),
      label,
      level,
      meta,
      name,
      silent,
      tableName,
    });
  }

  /**
   * Create logs table.
   * @return {Promise} result of creation within a Promise
   */
  init() {
    const { client, tableName } = this;

    return client.schema.hasTable(tableName).then((exists) => {
      if (!exists) {
        return client.schema.createTable(tableName, (table) => {
          table.increments();
          table.string('level');
          table.string('message');
          table.string('meta');
          table.timestamp('timestamp').defaultTo(client.fn.now());
        });
      }
      return exists;
    });
  }

  /**
   * End the connection
   * Return a Promise which resolves when all queries are finished and the underlying connections are closed.
   * @return {Promise} result within a Promise
   */
  end() {
    return this.client.destroy();
  }

  /**
   * Flush all logs
   * Return a Promise which resolves when all logs are finished.
   * @return {Promise} result within a Promise
   */
  flush() {
    const { client, tableName } = this;
    return client.from(tableName).del();
  }

  /**
   * Core logging method exposed to Winston. Metadata is optional.
   * @param {Object} info
   * @param {string} [info.level] - Level at which to log the message.
   * @param {string} [info.message] - Message to log
   * @param {Function} callback - Continuation to respond to when complete.
   */
  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    if (this.silent !== true) {
      const { client, defaultMeta, tableName } = this;
      const { level, message, ...meta } = info;

      const log = {
        level,
        message,
        meta: JSON.stringify({ ...meta, ...defaultMeta }),
        timestamp: moment().utc().toDate(),
      };

      const logQuery = () => client.insert(log).into(tableName);

      logQuery((error) => {
        if (error) {
          return handleCallback(callback, error);
        }

        return handleCallback(callback, null, true);
      });
    }
  }

  /**
   * Query the transport. Options object is optional.
   * @param {Object} options - Loggly-like query options for this instance.
   * @param {string} [options.from] - Start time for the search.
   * @param {string} [options.until=now] - End time for the search. Defaults to "now".
   * @param {string} [options.rows=100] - Limited number of rows returned by search. Defaults to 100.
   * @param {string} [options.order=desc] - Direction of results returned, either "asc" or "desc".
   * @param {string[]} [options.fields=[]]
   * @param {Function} callback - Continuation to respond to when complete.
   */
  query(options = {}, callback) {
    const { fields = [] } = options;

    let query = this.client.select(fields).from(this.tableName);

    if (options.from && options.until) {
      query = query.whereBetween('timestamp', [
        moment(options.from).utc().toDate(),
        moment(options.until).utc().toDate(),
      ]);
    }

    if (options.rows) {
      query = query.limit(options.rows);
    }

    if (options.order) {
      query = query.orderBy('timestamp', options.order);
    }

    const queryQuery = callbackify(() => query);

    queryQuery((error, data) => {
      if (error) {
        return handleCallback(callback, error);
      }
      return handleCallback(callback, null, data);
    });
  }
}

module.exports = SQLTransport;
