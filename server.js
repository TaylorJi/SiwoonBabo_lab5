const http = require("http");
const mysql = require("mysql2");
const fs = require("fs");
const url = require("url");
const querystring = require('querystring');

let errorMessages = [
  "Error inserting data into the database",
  "Not found",
  "Internal Server Error",
  "Failed to execute query",
];
let successMessages = ["Data inserted successfully!"];

const port = 3000;

const connection = mysql.createConnection({
  host: "sql3.freesqldatabase.com",
  user: "sql3653387",
  password: "sdvrkkxkNK",
  database: "sql3653387",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }

  console.log("Connected to the database!");

  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS patients (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dateOfBirth DATETIME NOT NULL
  ) ENGINE=InnoDB;
  `;

  connection.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Table is already created.");
  });

  const query = "Select * from patients";

  connection.query(query, (err, rows) => {
    if (err) throw err;
    console.log(successMessages[0], rows);
  });
});

http
  .createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST",
    };

    if (parsedUrl.pathname === "/insertData" && req.method === "POST") {
      const insertQuery = "INSERT INTO patients (name, dateOfBirth) VALUES ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";
      connection.query(insertQuery, (err, results) => {
          if (err) {
              res.writeHead(500, headers);
              res.end(JSON.stringify({ error: errorMessages[0] }));
          } else {
              res.writeHead(200, headers);
              res.end(JSON.stringify({ message: successMessages[0] }));
          }
      });
    } else if (parsedUrl.pathname === "/submitQuery" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
          body += chunk.toString();
      });
      req.on("end", () => {
          const userQuery = querystring.parse(body).query.trim();

          // Check query type
          if (userQuery.toUpperCase().startsWith('INSERT') || userQuery.toUpperCase().startsWith('SELECT')) {
              connection.query(userQuery, (err, results) => {
                  if (err) {
                      res.writeHead(500, headers);
                      res.end(JSON.stringify({ error: errorMessages[3] }));
                  } else if (results.length === 0) {
                      res.writeHead(404, headers);
                      res.end(JSON.stringify({ error: errorMessages[1] }));
                  } else {
                      res.writeHead(200, headers);
                      res.end(JSON.stringify(results));
                  }
              });
          } else {
              res.writeHead(400, headers); // Bad Request for unsupported query types
              res.end(JSON.stringify({ error: "Unsupported query type." }));
          }
      });
  } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(errorMessages[1]);
  }





    // if (parsedUrl.pathname === "/insertData" && req.method === "POST") {
    //   const insertQuery =
    //     "INSERT INTO patients (name, dateOfBirth) VALUES ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";

    //   connection.query(insertQuery, (err, results) => {
    //     if (err) {
    //       res.writeHead(500, headers);
    //       res.end(
    //         JSON.stringify({
    //           message: errorMessages[0],
    //         })
    //       );
    //     } else {
    //       res.writeHead(200, headers);
    //       res.end(JSON.stringify({ message: successMessages[0] }));
    //       console.log(successMessages[0]);
    //     }
    //   });
    // } else if (parsedUrl.pathname === "/submitQuery") {
    //   if (req.method === "POST") {
    //     let body = "";
    //     req.on("data", (chunk) => {
    //       body += chunk.toString();
    //     });
    //     req.on("end", () => {
    //       const query = querystring.parse(body).query;
    //       connection.query(query, (err, results) => {
    //         if (err) {
    //           res.writeHead(500, headers);
    //           res.end(JSON.stringify({ error: errorMessages[3] }));
    //         } else {
    //           res.writeHead(200, headers);
    //           res.end(JSON.stringify(results));
    //         }
    //       });
    //     });
    //   } else if (req.method === "GET") {
    //     const query = parsedUrl.query.query;
    //     connection.query(query, (err, results) => {
    //       if (err) {
    //         res.writeHead(500, headers);
    //         res.end(JSON.stringify({ error: errorMessages[3] }));
    //       } else {
    //         res.writeHead(200, headers);
    //         res.end(JSON.stringify(results));
    //       }
    //     });
    //   }
    // } else {
    //   res.writeHead(404, { "Content-Type": "text/plain" });
    //   res.end(errorMessages[1]);
    // }
  })
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
