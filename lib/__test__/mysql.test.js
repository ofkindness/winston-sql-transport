/**
 * @module 'mysql-test'
 * @fileoverview Tests of winston transport for logging into MySQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */
const { config } = require('dotenv');

const logTestSuite = require('./suite/log');
const queryTestSuite = require('./suite/query');
const SQLTransport = require('../winston-sql-transport');

config();

const transportConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  pool: {
    min: 0,
    max: 10,
  },
  tableName: 'winston_logs',
};

describe('MySQL', () => {
  const transport = new SQLTransport(transportConfig);

  beforeAll(() => transport.init());

  logTestSuite(transport);

  queryTestSuite(transport);

  afterAll(() => transport.end());
});
