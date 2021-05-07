/**
 * @module 'pg-test'
 * @fileoverview Tests of winston transport for logging into PostgreSQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const testSuite = require('abstract-winston-transport');

const { SQLTransport } = require('../lib/winston-sql-transport');

testSuite({
  name: 'Postgres',
  Transport: SQLTransport,
  construct: {
    client: 'pg',
    connection: `postgres://${process.env.PGUSER}\
:${process.env.PGPASSWORD}\
@${process.env.PGHOST}\
:${process.env.PGPORT}\
/${process.env.PGDATABASE}`,
    name: 'Postgres',
    pool: {
      min: 0,
      max: 10
    },
    tableName: 'winston_logs'
  }
});
