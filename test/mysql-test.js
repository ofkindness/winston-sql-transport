/**
 * @module 'mysql-test'
 * @fileoverview Tests of winston transport for logging into MySQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const { SQLTransport } = require('./../lib/winston-sql-transport');
const transport = require('./transport.js');
const vows = require('vows');
const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new SQLTransport({
      client: 'mysql',
      connection: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      },
      name: 'MySQL',
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
    'An instance of the SQL Transport - MySQL': transport(logger, logger.transports.SQLTransport)
  })
  .export(module);

// const vows = require('vows');
// const transport = require('winston/test/transports/transport');
// const Universal = require('../lib/winston-sql-transport.js');
//
// vows.describe('mysql-transport')
//   .addBatch({
//     'An instance of the MySQL Transport': transport(Universal, {
// client: 'mysql',
// connection: {
//   host: process.env.MYSQL_HOST,
//   port: process.env.MYSQL_PORT,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DBNAME
// },
// name: 'MySQL'
//     })
//   })
//   .export(module);

// "mssql": "^3.3.0",
// "mysql": "^2.14.1",
// "pg": "^7.3.0",
