const mysql = require("mysql");
const dbConfig = require("./config.js");

// Create a connection to the database
const conn = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USERNAME,
  password: dbConfig.PASSWORD,
  database: dbConfig.DATABASE
});

// open the MySQL connection
conn.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = conn;