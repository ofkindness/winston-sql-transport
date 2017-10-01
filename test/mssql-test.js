const SQLServer = require('./../lib/winston-sql-transport');
const transport = require('./transport.js');
const vows = require('vows');
const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new SQLServer({
      client: 'mssql',
      connection: {
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_HOST,
        database: process.env.MSSQL_DB
      },
      name: 'SQLServer',
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
    'An instance of the SQL Transport - SQL server': transport(logger, logger.transports.SQL)
  })
  .export(module);
