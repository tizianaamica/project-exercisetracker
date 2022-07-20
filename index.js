const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bodyParser = require("body-parser");
require("dotenv").config();

//mongo conection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI);

//schema collection
const users = new Schema({
  username: {
    type: String,
    required: true,
  },
  count: Number,
});

const exercises = new Schema({
  log: [
    {
      date: String,
      duration: Number,
      description: String,
    },
  ],
});

const User = mongoose.model("User", users);
const Exercise = mongoose.model("Exercise", exercises);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const username = req.body.username;
  const user = new User({ username, count: 0 });
  user.save((err, data) => {
    if (err) {
      res.json({ error: err });
    }
    res.json(data);
  });
});

app.get("/api/users", (req, res) => {
  User.find((err, data) => {
    if (data) {
      res.json(data);
    }
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description } = req.body;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? "Mon Jan 01 1990" : "Thu Nov 04 2021";
  const id = req.params._id;

  const exer = {
    date,
    duration,
    description,
  };

  User.findById(id, (err, user) => {
    if (user) {
      const updateExcercise = {
        _id: id,
        username: user.username,
        ...exer,
      };
      res.json(updateExcercise);
    }
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query;

  User.findById(req.params._id, (err, user) => {
    if (user) {
      if (from || to || limit) {
        const logs = user.log;
        const filteredLogs = logs.filter((log) => {
          const formattedLog = new Date(log.date).toDateString();
          return true;
        });

        const slicedLogs = limit ? filteredLogs.slice(0, limit) : filteredLogs;
        user.log = slicedLogs;
      }
      res.json(user);
    }
  });
});

app.get("/mongo-health", (req, res) => {
  const mySecret = process.env["MONGO_URI"];
  res.json({ status: mongoose.connection.readyState });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
