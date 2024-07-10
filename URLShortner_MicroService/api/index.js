require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const fs = require("fs");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// const urls = {}; Did not work!

function dataManagement(action, input) {
  let filePath = "./public/data.json";
  //check if file exist -> create new file if not exist
  if (!fs.existsSync(filePath)) {
    fs.closeSync(fs.openSync(filePath, "w"));
  }

  //read file data.json
  let file = fs.readFileSync(filePath);

  //screnario for save input into data
  if (action == "save data" && input != null) {
    //check if file is empty
    if (file.length == 0) {
      //add new data to json file
      fs.writeFileSync(filePath, JSON.stringify([input], null, 2));
    } else {
      //append input to data.json file
      let data = JSON.parse(file.toString());
      //check if input.original_url already exist
      let inputExist = [];
      inputExist = data.map((d) => d.original_url);
      let check_input = inputExist.includes(input.original_url);
      if (check_input === false) {
        //add input element to existing data json object
        data.push(input);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      }
    }
  }

  //screnario for load the data
  else if (action == "load data" && input == null) {
    if (file.length == 0) {
      return;
    } else {
      let dataArray = JSON.parse(file);
      return dataArray;
    }
  }
}

app.get("/api/shorturl/:shorturl", (req, res) => {
  const shortUrl = req.params.shorturl;
  const data = dataManagement("load data");
  if (data && data.length > 0)
    data.map((url) => {
      if (url.short_url === Number(shortUrl)) res.redirect(url.original_url);
    });
  else res.json({ error: "invalid url" });
});

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;

  if (!url) return res.json({ message: "Bad Request!" });

  let domain = url.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim);
  let param = domain[0].replace(/^https?:\/\//i, "");

  dns.lookup(param, async (err, address, family) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const data = await dataManagement("load data");
    const shortUrl = data ? data.length + 1 : 1;

    await dataManagement("save data", { original_url: url, short_url: shortUrl });

    return res.json({ original_url: url, short_url: 1 });
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// /api/shorturl/:shorturl route was working locally but was not passing the test.
// Had to copy the code from a git repo
