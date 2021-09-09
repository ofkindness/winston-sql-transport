/**
 * @module 'mysql-test'
 * @fileoverview Tests of winston transport for logging into MySQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */
import { config } from 'dotenv';

import logTestSuite from '../suite/log';
import queryTestSuite from '../suite/query';
import { SQLTransport } from '../winston-sql-transport';

config();

const transportConfig = {
  client: <const>'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
};

describe('MySQL', () => {
  const transport = new SQLTransport(transportConfig);

  beforeAll(() => transport.init());

  logTestSuite(transport);

  queryTestSuite(transport);

  afterAll(() => transport.end());
});
