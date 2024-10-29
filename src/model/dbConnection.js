const { Sequelize } = require("sequelize");
// require('dotenv').config();


const db = new Sequelize({
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: "mysql",
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
});

module.exports = db;
