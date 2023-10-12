const http = require("http");
const mysql = require("mysql2");
const fs = require("fs");
const url = require("url");

let errorMessages = ["Error inserting data into the database", "Not found", "Internal Server Error"];
let successMessages = ["Data inserted successfully!"];

const { parse } = require("querystring");
const port = 3000;

const connection = mysql.createConnection({
  host: "localhost",

  user: "root",

  password: null,

  database: "Comp4537_lab5",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);

    return;
  }

  console.log("Connected to the database!");

  // Create table if not exists

  const createTableQuery = `

CREATE TABLE IF NOT EXISTS patient (

id INT AUTO_INCREMENT PRIMARY KEY,

name VARCHAR(255) NOT NULL,

age INT NOT NULL,

diagnosis VARCHAR(255)

) ENGINE=InnoDB;

`;

  connection.query(createTableQuery, (err, result) => {
    if (err) throw err;

    console.log("Table is already created.");
  });

  $query = "Select * from patient";

  connection.query($query, (err, rows, result) => {
    if (err) throw err;

    console.log(successMessages[0], rows);
  });
});

http
  .createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // to allow cross-origin requests
      "Access-Control-Allow-Methods": "GET, POST",
    };

    if (parsedUrl.pathname === "/") {
      fs.readFile("index.html", "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(ErrorMessages[2]);
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    } else if (parsedUrl.pathname === "/insertData" && req.method === "POST") {
      const insertQuery = "INSERT INTO patient (name, dateOfBirth) VALUES ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";

      connection.query(insertQuery, (err, results, rows) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: errorMessages[0]
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: successMessages[0] }));
          console.log(successMessages[0], rows);
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(errorMessages[1]);
    }
  })
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
