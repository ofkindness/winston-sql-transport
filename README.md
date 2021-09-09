# winston-sql-transport

[![CircleCI](https://circleci.com/gh/ofkindness/winston-sql-transport/tree/master.svg?style=svg)](https://circleci.com/gh/ofkindness/winston-sql-transport/tree/master)
[![NPM version](https://img.shields.io/npm/v/winston-sql-transport.svg)](https://npmjs.org/package/winston-sql-transport)
[![Dependency Status](https://david-dm.org/ofkindness/winston-sql-transport.svg?theme=shields.io)](https://david-dm.org/ofkindness/winston-sql-transport)
[![NPM Downloads](https://img.shields.io/npm/dm/winston-sql-transport.svg)](https://npmjs.org/package/winston-sql-transport)

Universal [winston](https://www.npmjs.com/package/winston) SQL transport.

Supports:

- MySQL
- PostgreSQL
- SQL Server

via [knex](https://knexjs.org/) library.

## Installation

```console
  $ npm install winston
  $ npm install winston-sql-transport
```

and then install the appropriate database library: [mysql2](https://github.com/sidorares/node-mysql2) for MySQL or MariaDB, [pg](https://github.com/brianc/node-postgres) for PostgreSQL, or [tedious](https://github.com/tediousjs/tedious) for MSSQL.

## Add

```js
// CommonJS
const winston = require('winston');
const { SqlTransport } = require('winston-sql-transport');

// ES Modules
import winston from 'winston';
import { SqlTransport } from 'winston-sql-transport';
```

## Transport Options

### See the default values used:

```
  `level` = 'info', Level at which to log the message.
  `name` = 'SqlTransport', Name for transport
  `silent` = false, Suppress logs.
  `tableName` = 'winston_logs', Name for database table
  `defaultMeta` (optional), Will be added by default to meta for all logs;
```

## Configure transport with the chosen client

```js
const const transportConfig = {
  client: 'mssql',
  connection: {
    user: MSSQL_USER,
    password: MSSQL_PASSWORD,
    server: MSSQL_HOST,
    database: MSSQL_DB,
  },
}

const transportConfig = {
  client: 'mysql2',
  connection: {
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  },
};

const transportConfig = {
  client: 'pg',
  connection: `postgres://${PGUSER}\
:${PGPASSWORD}\
@${PGHOST}\
:${PGPORT}\
/${PGDATABASE}`,
};
```

## Example

```js
const transportConfig = {
  client: 'mssql',
  connection: {
    user: MSSQL_USER,
    password: MSSQL_PASSWORD,
    server: MSSQL_HOST,
    database: MSSQL_DB,
  },
  defaultMeta: { example_winston_logs: true },
  name: 'ExampleSqlTransport',
  tableName: 'winston_logs',
};
```

## Usage

```js
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new SqlTransport(transportConfig)],
});

logger.log({
  level: 'info',
  message: 'Hello there.',
});
```

### If you need to create table with a transport:

```js
(async () => {
  const transport = new SqlTransport(transportConfig);
  await transport.init();
})();
```

## Querying Logs

This transport supports querying of logs with Loggly-like options.

```js
const options = {
  fields: ['message'],
  from: new Date() - 24 * 60 * 60 * 1000,
  until: new Date(),
  start: 0,
  limit: 10,
  order: 'desc',
};

//
// Find items logged between today and yesterday.
//
logger.query(options, (err, results) => {
  if (err) {
    throw err;
  }

  console.log(results);
});
```

## Run Tests

The tests are written in [jest](https://jestjs.io/), and designed to be run with npm.

```bash
  $ npm test
```

## LICENSE

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
