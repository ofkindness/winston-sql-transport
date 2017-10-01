const Postgres = require('./../lib/winston-sql-transport');
const transport = require('./transport.js');
const vows = require('vows');
const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new Postgres({
      client: 'pg',
      connection: `postgres://${process.env.PGUSER}\
:${process.env.PGPASSWORD}\
@${process.env.PGHOST}\
:${process.env.PGPORT}\
/${process.env.PGDATABASE}`,
      name: 'Postgres',
      pool: {
        min: 0,
        max: 10
      },
      tableName: 'winston_logs'
    })
  ]
});

vows
  .describe('winston-sql-transport')
  .addBatch({
    'An instance of the SQL Transport - PostgreSQL': transport(logger, logger.transports.SQL)
  })
  .export(module);
