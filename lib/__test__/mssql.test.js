/**
 * @module 'mssql-test'
 * @fileoverview Tests of winston transport for logging into SQLServer
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */
const { config } = require('dotenv');

const logTestSuite = require('./suite/log');
const queryTestSuite = require('./suite/query');
const SQLTransport = require('../winston-sql-transport');

config();

const transportConfig = {
  client: 'mssql',
  connection: {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_HOST,
    database: process.env.MSSQL_DB,
  },
  pool: {
    min: 0,
    max: 10,
  },
  tableName: 'winston_logs',
};

describe('MSSQL', () => {
  const transport = new SQLTransport(transportConfig);

  beforeAll(() => transport.init());

  logTestSuite(transport);

  queryTestSuite(transport);

  afterAll(() => transport.end());
});
