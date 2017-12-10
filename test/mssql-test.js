/**
 * @module 'mssql-test'
 * @fileoverview Tests of winston transport for logging into SQLServer
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const assert = require('assert');
const { Logger } = require('winston');
const { SQLTransport } = require('./../lib/winston-sql-transport');
const transport = require('./transport.js');
const vows = require('vows');

const logger = new Logger({
  transports: [
    new SQLTransport({
      client: 'mssql',
      connection: {
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_HOST,
        database: process.env.MSSQL_DB
      },
      name: 'SQLTransport',
      pool: {
        min: 0,
        max: 10
      },
      tableName: 'winston_logs'
    })
  ]
});

vows
  .describe('winston-sql-transport')
  .addBatch({
    'An instance of the SQL Transport - SQL Server': {
      topic: function topic() {
        const { callback } = this;
        logger.transports.SQLTransport.init().then(() => callback(null, true));
      },
      'should create table': (err, result) => {
        assert.isNull(err);
        assert.ok(result === true);
      }
    }
  })
  .addBatch({
    'An instance of the SQL Transport - SQL Server': transport(logger, logger.transports.SQLTransport)
  })
  .export(module);
