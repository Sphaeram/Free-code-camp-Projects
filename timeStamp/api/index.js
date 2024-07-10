const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

app.get("/api/:date", (req, res) => {
  const { date } = req.params;

  const validDate = (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  };

  try {
    if (!date.includes("-") && !isNaN(Number(date))) {
      return res
        .status(200)
        .json({ unix: Number(date), utc: new Date(Number(date)).toUTCString() });
    }
    if (validDate(date)) {
      const parsedDate = new Date(date);
      return res.json({ unix: parsedDate.getTime(), utc: parsedDate.toUTCString() });
    } else {
      return res.status(500).json({ error: "Invalid Date" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Invalid Date" });
  }
});

app.get("/api", (req, res) => {
  try {
    const date = new Date(Date.now());
    return res.status(200).json({ unix: date.getTime(), utc: date.toUTCString() });
  } catch (error) {
    return res.status(500).json({ error: "Invalid Date" });
  }
});

// Listen on port set in environment constiable or default to 3000
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
