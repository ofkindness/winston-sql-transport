/**
 * @module 'mssql-test'
 * @fileoverview Tests of winston transport for logging into SQLServer
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const testSuite = require('abstract-winston-transport');

const { SQLTransport } = require('../lib/winston-sql-transport');

const name = 'MSSQL';

const construct = {
  client: 'mssql',
  connection: {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_HOST,
    database: process.env.MSSQL_DB
  },
  name,
  pool: {
    min: 0,
    max: 10
  },
  tableName: 'winston_logs'
};

const mssqlTransport = new SQLTransport(construct);

describe(name, () => {
  before(() => mssqlTransport.init());

  testSuite({
    name,
    Transport: SQLTransport,
    construct
  });
});
