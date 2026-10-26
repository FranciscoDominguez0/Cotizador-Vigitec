const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Conexión ORM a PostgreSQL usando Sequelize.
 * Lee las credenciales exclusivamente desde las variables de entorno (.env).
 */
const conexionOrm = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = conexionOrm;
