/**
 * @module 'pg-test'
 * @fileoverview Tests of winston transport for logging into PostgreSQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const { config } = require('dotenv');

const logTestSuite = require('./suite/log');
const queryTestSuite = require('./suite/query');
const SQLTransport = require('../winston-sql-transport');

config();

const transportConfig = {
  client: 'pg',
  connection: `postgres://${process.env.PGUSER}\
:${process.env.PGPASSWORD}\
@${process.env.PGHOST}\
:${process.env.PGPORT}\
/${process.env.PGDATABASE}`,
  pool: {
    min: 0,
    max: 10,
  },
  tableName: 'winston_logs',
};

describe('Postgres', () => {
  const transport = new SQLTransport(transportConfig);

  beforeAll(() => transport.init());

  logTestSuite(transport);

  queryTestSuite(transport);

  afterAll(() => transport.end());
});
