require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

app.get("/api/whoami", (req, res) => {
  return res.status(200).json({
    ipaddress: req.ip,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"],
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
