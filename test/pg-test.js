/**
 * @module 'pg-test'
 * @fileoverview Tests of winston transport for logging into PostgreSQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const vows = require('vows');
const transport = require('winston/test/transports/transport');
const Universal = require('../lib/winston-sql-transport.js');

vows.describe('pg-transport')
  .addBatch({
    'An instance of the Postgres Transport': transport(Universal, {
      client: 'pg',
      connectionString: `postgres://${process.env.PGUSER}\
:${process.env.PGPASSWORD}\
@${process.env.PGHOST}\
:${process.env.PGPORT}\
/${process.env.PGDATABASE}`,
      name: 'Postgres'
    })
  })
  .export(module);
