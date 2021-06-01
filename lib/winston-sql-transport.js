/**
 * @module 'winston-sql-transport'
 * @fileoverview Winston universal SQL transport for logging
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */
const knex = require('knex');
const moment = require('moment');
const Transport = require('winston-transport');

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
    this.name = 'SQLTransport';

    //
    // Configure your storage backing as you see fit
    //
    if (!options.client) {
      throw new Error('You have to define client');
    }

    const connection = options.connection || {};

    this.client = knex({
      client: options.client,
      connection,
    });

    const {
      label = '',
      level = 'info',
      meta = {},
      silent = false,
      tableName = 'winston_logs',
    } = options;

    Object.assign(this, {
      label,
      level,
      meta,
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
   * Core logging method exposed to Winston. Metadata is optional.
   * @param {string} level - Level at which to log the message.
   * @param {string} message - Message to log
   * @param {Object} meta - Metadata to log
   * @param {Function} callback - Continuation to respond to when complete.
   */
  async log(info, callback) {
    const { level, message, ...logMeta } = info;
    const { client, tableName } = this;

    try {
      await client
        .insert({
          level,
          message,
          meta: JSON.stringify({ ...logMeta, ...this.meta }),
          timestamp: moment().utc().toDate(),
        })
        .into(tableName);
      callback(null, true);
    } catch (error) {
      callback(error);
    } finally {
      this.emit('logged', info);
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
  async query(options = {}, callback) {
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

    try {
      const data = await query;
      callback(null, data);
    } catch (error) {
      callback(error);
    }
  }
}

module.exports = { SQLTransport };
