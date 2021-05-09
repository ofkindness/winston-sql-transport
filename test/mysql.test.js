/**
 * @module 'mysql-test'
 * @fileoverview Tests of winston transport for logging into MySQL
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */

const testSuite = require('abstract-winston-transport');

const { SQLTransport } = require('../lib/winston-sql-transport');

const name = 'MySQL';

const construct = {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  name,
  pool: {
    min: 0,
    max: 10,
  },
  tableName: 'winston_logs',
};

const mysqlTransport = new SQLTransport(construct);

describe(name, () => {
  before(() => mysqlTransport.init());

  testSuite({
    construct,
    name,
    Transport: SQLTransport,
  });
});
