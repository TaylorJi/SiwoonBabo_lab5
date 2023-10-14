const http = require("http");
const mysql = require("mysql2");
const fs = require("fs");
const url = require("url");

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
CREATE TABLE IF NOT EXISTS patient (
id INT(11) AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
dateOfBirth DATETIME NOT NULL,
) ENGINE=InnoDB;
`;

  connection.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Table is already created.");
  });

  const query = "Select * from patient";

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

    if (parsedUrl.pathname === "/") {
      fs.readFile("index.html", "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(errorMessages[2]);
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    } else if (parsedUrl.pathname === "/insertData" && req.method === "POST") {
      const insertQuery =
        "INSERT INTO patient (name, age, diagnosis) VALUES ('Sara Brown', 23, 'Healthy'), ('John Smith', 83, 'Healthy'), ('Jack Ma', 62, 'Healthy'), ('Elon Musk', 24, 'Healthy')";

      connection.query(insertQuery, (err, results) => {
        if (err) {
          res.writeHead(500, headers);
          res.end(
            JSON.stringify({
              message: errorMessages[0],
            })
          );
        } else {
          res.writeHead(200, headers);
          res.end(JSON.stringify({ message: successMessages[0] }));
          console.log(successMessages[0]);
        }
      });
    } else if (parsedUrl.pathname === "/submitQuery") {
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          const query = querystring.parse(body).query;
          connection.query(query, (err, results) => {
            if (err) {
              res.writeHead(500, headers);
              res.end(JSON.stringify({ error: errorMessages[3] }));
            } else {
              res.writeHead(200, headers);
              res.end(JSON.stringify(results));
            }
          });
        });
      } else if (req.method === "GET") {
        const query = parsedUrl.query.query;
        connection.query(query, (err, results) => {
          if (err) {
            res.writeHead(500, headers);
            res.end(JSON.stringify({ error: errorMessages[3] }));
          } else {
            res.writeHead(200, headers);
            res.end(JSON.stringify(results));
          }
        });
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(errorMessages[1]);
    }
  })
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
