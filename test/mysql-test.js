'use strict';
/**
 * @module 'mysql-test'
 * @fileoverview Tests of winston transport for logging into MySQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

var vows = require('vows');
var transport = require('winston/test/transports/transport');
var Universal = require('../lib/winston-sql-transport.js');

vows.describe('mysql-transport')
  .addBatch({
    'An instance of the MySQL Transport': transport(Universal, {
      client: 'mysql',
      connection: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DBNAME
      },
      name: 'MySQL'
    })
  })
  .export(module);
