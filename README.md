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

and then install the appropriate database library: [pg](https://github.com/brianc/node-postgres) for PostgreSQL, [mysql2](https://github.com/sidorares/node-mysql2) for MySQL or MariaDB or [mssql](https://github.com/patriksimek/node-mssql) for MSSQL.

## Options

See the default values used:

```js
const options = {
  tableName: 'winston_logs',
};
```

## Usage

```js
const winston = require('winston');
const SQLTransport = require('winston-sql-transport');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new SQLTransport({
      tableName: 'winston_logs',
    }),
  ],
});

module.exports = logger;
```

## Logging

```js
logger.log({
  level: 'info',
  message: 'Hello there.',
});
```

## Querying Logs

This transport supports querying of logs with Loggly-like options. [See Loggly Search API](https://www.loggly.com/docs/api-retrieving-data/)

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
