/**
 * @module 'pg-test'
 * @fileoverview Tests of winston transport for logging into PostgreSQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const logSuite = require('abstract-winston-transport');

const querySuit = require('./query.suit');
const { SQLTransport } = require('../lib/winston-sql-transport');

const name = 'Postgres';

const construct = {
  client: 'pg',
  connection: `postgres://${process.env.PGUSER}\
:${process.env.PGPASSWORD}\
@${process.env.PGHOST}\
:${process.env.PGPORT}\
/${process.env.PGDATABASE}`,
  name,
  pool: {
    min: 0,
    max: 10,
  },
  tableName: 'winston_logs',
};

const pgTransport = new SQLTransport(construct);

describe(name, () => {
  before(() => pgTransport.init());

  logSuite({
    name: 'Postgres',
    Transport: SQLTransport,
    construct,
  });

  querySuit({
    transport: mysqlTransport,
  });
});
