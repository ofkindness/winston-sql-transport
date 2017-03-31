'use strict';
/**
 * @module 'pg-test'
 * @fileoverview Tests of winston transport for logging into PostgreSQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

var vows = require('vows');
var transport = require('winston/test/transports/transport');
var Universal = require('../lib/winston-sql-transport.js');

vows.describe('pg-transport')
  .addBatch({
    'An instance of the Postgres Transport': transport(Universal, {
      client: 'pg',
      conString: 'postgres://' + process.env.POSTGRES_USER +
        ':' + process.env.POSTGRES_PASSWORD +
        '@' + process.env.POSTGRES_HOST +
        ':' + process.env.POSTGRES_PORT +
        '/' + process.env.POSTGRES_DBNAME,
      name: 'Postgres'
    })
  })
  .export(module);
