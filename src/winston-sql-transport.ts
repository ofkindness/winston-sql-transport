/**
 * @module 'winston-sql-transport'
 * @fileoverview Winston universal SQL transport for logging
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */
import { knex } from 'knex';
import moment from 'moment';
import Transport from 'winston-transport';
import { callbackify } from 'util';

import { handleCallback } from './helpers';

export enum ClientType {
  'mssql',
  'mysql2',
  'pg',
}

export interface SqlTransportOptions {
  client: keyof typeof ClientType;
  connection: any;
  defaultMeta?: any;
  label?: string;
  level?: string;
  name?: string;
  silent?: boolean;
  tableName?: string;
}

export interface SqlTransport extends SqlTransportOptions {
  client: any;
  defaultMeta: any;
  label: string;
  level: string;
  name: string;
  silent: boolean;
  tableName: string;
}

export interface QueryOptions {
  fields?: string[];
  from?: Date | string;
  order?: string;
  rows?: number;
  until?: Date | string;
}

export class SqlTransport extends Transport {
  /**
   * Constructor for the universal transport object.
   * @constructor
   * @param {Object} options
   * @param {string} options.client - Database client
   * @param {string} options.connection - Database connection uri | object
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
  constructor(options: SqlTransportOptions) {
    super();

    const {
      client,
      connection = {},
      defaultMeta = {},
      label = '',
      level = 'info',
      name = 'SqlTransport',
      silent = false,
      tableName = 'winston_logs',
    } = options;

    if (!client) {
      throw new Error('You have to define knex client');
    }

    this.client = knex({
      client,
      connection,
    });

    this.defaultMeta = defaultMeta;
    this.label = label;
    this.level = level;
    this.name = name;
    this.silent = silent;
    this.tableName = tableName;
  }

  /**
   * Create logs table.
   * @return {Promise} result of creation within a Promise
   */
  init(): Promise<any> {
    return this.client.schema
      .hasTable(this.tableName)
      .then((exists: boolean) => {
        if (!exists) {
          return this.client.schema.createTable(
            this.tableName,
            (table: any) => {
              table.increments();
              table.string('level');
              table.string('message');
              table.string('meta');
              table.timestamp('timestamp').defaultTo(this.client.fn.now());
            }
          );
        }
        return exists;
      });
  }

  /**
   * End the connection
   * Return a Promise which resolves when all queries are finished and the underlying connections are closed.
   * @return {Promise} result within a Promise
   */
  end(): Promise<any> {
    return this.client.destroy();
  }

  /**
   * Flush all logs
   * Return a Promise which resolves when all logs are finished.
   * @return {Promise} result within a Promise
   */
  flush(): Promise<any> {
    return this.client.from(this.tableName).del();
  }

  /**
   * Core logging method exposed to Winston. Metadata is optional.
   * @param {Object} info
   * @param {string} [info.level] - Level at which to log the message.
   * @param {string} [info.message] - Message to log
   * @param {Function} callback - Continuation to respond to when complete.
   */
  log(info: any, callback: (e: unknown, data: any) => void) {
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

      const logQuery = async (cb: (e: unknown) => void) => {
        try {
          await client.insert(log).into(tableName);
        } catch (error) {
          cb(error);
        }
      };

      logQuery((error: unknown) => {
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
  query(options: QueryOptions, callback: (e: unknown, data: any) => void) {
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

    const queryQuery = callbackify<any>(() => query);

    queryQuery((error: unknown, data: any) => {
      if (error) {
        return handleCallback(callback, error);
      }
      return handleCallback(callback, null, data);
    });
  }
}
