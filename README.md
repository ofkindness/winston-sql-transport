# winston-sql-transport

Universal [winston](https://www.npmjs.com/package/winston) SQL transport.

Supports:
- MySQL
- OracleDB
- PostgreSQL
- SQL server

via [knex](http://knexjs.org/) library.

## Installation

```console
  $ npm install winston
  $ npm install winston-sql-transport
```

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

const logger = new (winston.Logger)({
  transports: [
    new (SQLTransport)({
      tableName: 'winston_logs',
    })]
});

module.exports = logger;
```

## Logging

```js
logger.log('info', 'message', {});
```

## Querying Logs

This transport supports querying of logs with Loggly-like options. [See Loggly Search API](https://www.loggly.com/docs/api-retrieving-data/)

```js
const options = {
  fields: ['message'],
  from: new Date - 24 * 60 * 60 * 1000,
  until: new Date,
  start: 0,
  limit: 10,
  order: 'desc'
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

## Streaming Logs

Streaming allows you to stream your logs back

```js
//
// Start at the end.
//
logger.stream({ start: -1 }).on('log', (log) => {
  console.log(log);
});
```

## Run Tests

The tests are written in [vows](http://vowsjs.org), and designed to be run with npm.

```bash
  $ npm test
```

## LICENSE

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
