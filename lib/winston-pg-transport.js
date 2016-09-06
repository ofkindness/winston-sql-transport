'use strict';
/**
 * @module 'winston-pg-transport'
 * @fileoverview Winston transport for logging into PostgreSQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

var circularJSON = require('circular-json');
var moment = require('moment');
var pgp = require('pg-promise')();
var sql = require('sql');
var Stream = require('stream').Stream;
var util = require('util');
var winston = require('winston');

// var JSONStream = require('JSONStream');

/**
 * Constructor for the Postgres transport object.
 * @constructor
 * @param {Object} options
 * @param {string} [options.level=info] - Level of messages that this transport
 * should log.
 * @param {boolean} [options.silent=false] - Boolean flag indicating whether to
 * suppress output.
 * @param {string} options.conString - Postgres connection uri
 * @param {string} [options.tableName=winston_logs] - The name of the table you
 * want to store log messages in.
 * @param {string} [options.label] - Label stored with entry object if defined.
 * @param {string} [options.name] - Transport instance identifier. Useful if you
 * need to create multiple Postgres transports.
 */
var Postgres = winston.transports.Postgres = function(options) {
  //
  // Name this logger
  //
  this.name = 'Postgres';

  //
  // Set the level from your options
  //
  this.level = options.level || 'info';

  this.label = options.label || '';

  this.silent = options.silent || false;

  //
  // Configure your storage backing as you see fit
  //
  if (!options.conString) {
    throw new Error('You have to define conString');
  }

  this.client = pgp(options.conString);

  this.logs = sql.define({
    name: 'winston_logs' || options.tableName,
    columns: ['id', 'timestamp', 'level', 'message', 'meta']
  });
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(Postgres, winston.Transport);

/**
 * Core logging method exposed to Winston. Metadata is optional.
 * @param {string} level - Level at which to log the message.
 * @param {string} msg - Message to log
 * @param {Object} meta - Metadata to log
 * @param {Function} callback - Continuation to respond to when complete.
 */
Postgres.prototype.log = function(level, msg, meta, callback) {
  //
  // Store this message and metadata, maybe use some custom logic
  // then callback indicating success.
  //
  if (this.silent) {
    return callback(null, true);
  }

  var logQuery = this.logs.insert(this.logs.level.value(this.level), this.logs
      .message, this.logs.meta)
    .toQuery()
    .text;

  this.client.none(logQuery, [level, msg, circularJSON.stringify(meta)])
    .then(function() {
      // success;
      callback(null, true);
    })
    .catch(function(error) {
      // error;
      callback(error);
    });
};

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
Postgres.prototype.query = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var query = this.logs.from(this.logs);

  if (options.fields) {
    query = this.logs.select(options.fields);
  } else {
    query = this.logs.select(this.logs.star());
  }

  if (options.from && options.until) {
    query = query.where(this.logs.timestamp.gte(moment(options.from).utc().toDate()
        .toUTCString())
      .and(this.logs.timestamp.lte(moment(options.until).utc().toDate().toUTCString()))
    );
  }

  if (options.order) {
    query = query.order(this.logs.timestamp[options.order]);
  }

  if (options.rows) {
    query = query.limit(options.rows);
  }

  query = query.toQuery();

  this.client.any(query.text, query.values)
    .then(function(data) {
      // console.log("DATA:", data); // print data;
      callback(null, data);
    })
    .catch(function(error) {
      // console.log("ERROR:", error.message || error); // print the error;
      callback(error);
    });
};

/**
 * Returns a log stream for this transport. Options object is optional.
 * @param {Object} options - Stream options for this instance.
 * @param {Stream} stream - Pass in a pre-existing stream.
 * @return {Stream}
 */
Postgres.prototype.stream = function(options, stream) {
  options = options || {};

  stream = stream || new Stream();
  // var self = this;
  // var start = options.start;
  // console.log(stream, self, start);
  //
  stream.destroy = function() {
    this.destroyed = true;
  };
  //
  // if (start === -1) {
  //   start = null;
  // }
  //
  // if (start !== null) {
  // }

  // stream.emit('log', {});

  return stream;
};

module.exports = Postgres;
