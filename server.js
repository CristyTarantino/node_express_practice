"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const mongoose = require("mongoose");
const routes = require("./routes.js");
const auth = require("./auth.js");

const app = express();

fccTesting(app); //For FCC testing purposes

app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug");

mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
});

// get reference to database
const db = mongoose.connection;

// define Schema
const Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  password: String
});

// compile schema to model
var User = mongoose.model("User", UserSchema);

db.on("error", err => console.log("Database error: " + err));

db.on("connected", () => {
  console.log("Successful database connection");

  //serialization and app.listen

  auth(app, User, db);

  routes(app, User, db);

  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port " + process.env.PORT);
  });
});
