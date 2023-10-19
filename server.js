/**
 * GPT used:
debug CORS issue 
The writeHead function is a helper function that sets the necessary headers, including the CORS headers, on the response. By using this function to write the headers for all responses, you ensure that the CORS headers are always included.
The handling of OPTIONS requests is necessary because of how CORS works for certain types of requests. When a web page tries to make a "not-so-simple" request (like a POST request with a JSON body) to a different domain, the browser first sends a preflight OPTIONS request to the server to check if the actual request is allowed. The server needs to respond to this OPTIONS request with the appropriate CORS headers. If it doesn't, or if the headers don't allow the actual request, the browser will block the actual request. The added code handles OPTIONS requests by responding with a 204 No Content status and the necessary CORS headers.
The "Access-Control-Allow-Headers": "Content-Type" header is necessary to allow the Content-Type header in requests. This is important for your /submitQuery route, which expects POST requests with a Content-Type of application/json.
 */

let errorMessages = [
  "Error inserting data into the database",
  "Not found",
  "Internal Server Error",
  "Failed to execute query",
  "Unsupported query type.",
  "Table is already created."
];
let successMessages = ["Data inserted successfully!"];

const http = require("http");
const mysql = require("mysql2");
const url = require("url");
const querystring = require("querystring");

const port = 10000;

const connection = mysql.createConnection({
  host: "sql3.freesqldatabase.com",
  user: "sql3653387",
  password: "sdvrkkxkNK",
  database: "sql3653387",
});

function writeHead(res, statusCode) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}

connection.connect((err) => {
  if (err) {
    return;
  }

  // const createTableQuery = `
  // CREATE TABLE IF NOT EXISTS patients (
  // id INT(11) AUTO_INCREMENT PRIMARY KEY,
  // name VARCHAR(100) NOT NULL,
  // dateOfBirth DATETIME NOT NULL
  // ) ENGINE=InnoDB;
  // `;

  // connection.query(createTableQuery, (err, result) => {
  //   if (err) throw err;
  //   console.log(errorMessages[5]);
  // });

  // const query = "Select * from patients";

  // connection.query(query, (err, rows) => {
  //   if (err) throw err;
  //   console.log(successMessages[0], rows);
  // });
});

http
  .createServer(function (req, res) {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS patients (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dateOfBirth DATETIME NOT NULL
    ) ENGINE=InnoDB;
    `;
  
    connection.query(createTableQuery, (err, result) => {
      if (err) throw err;
      console.log(errorMessages[5]);
    });
  


    const parsedUrl = url.parse(req.url, true);

    // Handling OPTIONS request here
    if (req.method === "OPTIONS") {
      writeHead(res, 204);
      res.end();
      return;
    }

    if (parsedUrl.pathname === "/lab5/api/v1/insertData" && req.method === "POST") {
      const insertQuery =
        "INSERT INTO patients (name, dateOfBirth) VALUES ('Sara Brown', '1901-01-01'), ('John Smith', '1941-01-01'), ('Jack Ma', '1961-01-30'), ('Elon Musk', '1999-01-01')";
      connection.query(insertQuery, (err, results) => {
        if (err) {
          writeHead(res, 500);
          res.end(JSON.stringify({ error: errorMessages[0] }));
        } else {
          writeHead(res, 200);
          res.end(JSON.stringify({ message: successMessages[0] }));
        }
      });
    } else if (parsedUrl.pathname === "/lab5/api/v1/submitQuery" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const userQuery = querystring.parse(body).query.trim();

        // Check query type
        if (
          userQuery.toUpperCase().startsWith("INSERT") ||
          userQuery.toUpperCase().startsWith("SELECT")
        ) {
          connection.query(userQuery, (err, results) => {
            if (err) {
              writeHead(res, 500);
              res.end(JSON.stringify({ error: errorMessages[3] }));
            } else if (results.length === 0) {
              writeHead(res, 404);
              res.end(JSON.stringify({ error: errorMessages[1] }));
            } else {
              writeHead(res, 200);
              res.end(JSON.stringify(results));
            }
          });
        } else {
          writeHead(res, 400);
          res.end(JSON.stringify({ error: errorMessages[4] }));
        }
      });
    } else {
      writeHead(res, 404);
      res.end(JSON.stringify({ error: errorMessages[1] }));
    }
  })
  .listen(port);
