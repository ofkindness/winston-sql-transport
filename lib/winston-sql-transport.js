/**
 * @module 'winston-sql-transport'
 * @fileoverview Winston universal SQL transport for logging
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const circularJSON = require('circular-json');
const knex = require('knex');
const moment = require('moment');
const Stream = require('stream').Stream;
const winston = require('winston');


class SQL extends winston.Transport {
  /**
   * Constructor for the universal transport object.
   * @constructor
   * @param {Object} options
   * @param {string} options.client - Database client
   * @param {string} options.conString - Database connection uri
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
    this.name = 'Universal';

    //
    // Configure your storage backing as you see fit
    //

    if (!options.client) {
      throw new Error('You have to define client');
    }

    if (options.client === 'pg' && !options.conString) {
      throw new Error('You have to define conString');
    }

    const connection = options.conString || options.connection;

    this.client = knex({
      client: options.client,
      connection
    });

    this.label = options.label || '';

    //
    // Set the level from your options
    //
    this.level = options.level || 'info';

    this.silent = options.silent || false;

    this.tableName = options.tableName || 'winston_logs';
  }

  /**
   * Core logging method exposed to Winston. Metadata is optional.
   * @param {string} level - Level at which to log the message.
   * @param {string} msg - Message to log
   * @param {Object} meta - Metadata to log
   * @param {Function} callback - Continuation to respond to when complete.
   */
  log(...args) {
    const level = args.shift() || this.level;
    const message = args.shift() || '';
    let meta = args.shift();
    let callback = args.shift();

    if (typeof meta === 'function') {
      callback = meta;
      meta = {};
    }

    return this.client
      .insert({
        level,
        message,
        // timestamp: new Date().toUTCString(),
        timestamp: (new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S'),
        meta: circularJSON.stringify(meta)
      }).into(this.tableName).then(() => {
        callback(null, true);
      })
      .catch(callback);
  }

  /**
   * Query the transport. Options object is optional.
   * @param {Object} options - Loggly-like query options for this instance.
   * @param {string} [options.from] - Start time for the search.
   * @param {string} [options.until=now] - End time for the search. Defaults to "now".
   * @param {string} [options.rows=100] - Limited number of rows returned by search. Defaults to 100.
   * @param {string} [options.order=desc] - Direction of results returned, either "asc" or "desc".
   * @param {string} [options.fields]
   * @param {Function} callback - Continuation to respond to when complete.
   */
  query(...args) {
    let options = args.shift() || {};
    let callback = args.shift();

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options.fields = options.fields || [];

    let query = this.client
      .select(options.fields)
      .from(this.tableName);

    if (options.from && options.until) {
      query = query.whereBetween('timestamp', [
        moment(options.from).utc().toDate().toUTCString(),
        moment(options.until).utc().toDate().toUTCString()
      ]);
    }

    if (options.rows) {
      query = query.limit(options.rows);
    }

    if (options.order) {
      query = query.orderBy('timestamp', options.order);
    }

    query
      .then((data) => {
        callback(null, data);
      })
      .catch(callback);
  }

  /**
   * Returns a log stream for this transport. Options object is optional.
   * @param {Object} options - Stream options for this instance.
   * @param {Stream} stream - Pass in a pre-existing stream.
   * @return {Stream}
   */
  stream(...args) {
    const options = args.shift() || {};
    const stream = args.shift() || new Stream();

    const self = this;
    let start = options.start;
    // let last = '';
    let row = 0;

    if (start === -1) {
      start = null;
    }

    // if (start === null) {
    //   last = new Date(0).toISOString();
    // }

    stream.destroy = function destroy() {
      this.destroyed = true;
    };

    function poll() {
      self.client
        .select()
        .from(self.tableName)
        .then((results) => {
          if (stream.destroyed) {
            return;
          }

          results.forEach((log) => {
            if (start === null || row > start) {
              stream.emit('log', log);
            }
            row += 1;
          });

          setTimeout(poll, 2000);
        })
        .catch((error) => {
          if (stream.destroyed) {
            return;
          }
          stream.emit('error', error);
          setTimeout(poll, 2000);
        });
    }

    // we need to poll here.
    poll(start);

    return stream;
  }
}

module.exports = SQL;
