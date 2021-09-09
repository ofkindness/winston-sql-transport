/**
 * @module 'mssql-test'
 * @fileoverview Tests of winston transport for logging into SQLServer
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */
import { config } from 'dotenv';

import logTestSuite from '../suite/log';
import queryTestSuite from '../suite/query';
import { SQLTransport } from '../winston-sql-transport';

config();

const transportConfig = {
  client: <const>'mssql',
  connection: {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_HOST,
    database: process.env.MSSQL_DB,
  },
};

describe('MSSQL', () => {
  const transport = new SQLTransport(transportConfig);

  beforeAll(() => transport.init());

  logTestSuite(transport);

  queryTestSuite(transport);

  afterAll(() => transport.end());
});
