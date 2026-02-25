const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.SERVER_PORT || 3000;

app.get("/users", (req, res) => {
  res.status(200).json({ message: "OK - GET users" });
});

app.post("/users", (req, res) => {
  res.status(200).json({ message: "OK - POST users" });
});

app.put("/users/:id", (req, res) => {
  res.status(200).json({ message: "OK - PUT users" });
});

app.delete("/users/:id", (req, res) => {
  res.status(200).json({ message: "OK - DELETE users" });
});