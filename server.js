const express = require("express");

const bodyParser = require("body-parser");
//const { json } = require('body-parser');
const app = express();

var cors = require("cors");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cors());

var routes = require("./route");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
routes(app);

app.listen(3000, () => {
  console.log("Server started on post");
});
