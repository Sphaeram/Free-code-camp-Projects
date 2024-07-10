const express = require("express");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const path = require("path");

///////////////////////////////
// vercel only allows "read files" & not "write files". Thus, the image can't be uploaded live.
///////////////////////////////

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "public/images";
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fields = [{ name: "upfile", maxCount: 1 }];

const upload = multer({
  storage: storage,
}).fields(fields);

app.post("/api/fileanalyse", upload, (req, res) => {
  res.json({
    name: req.files.upfile[0].originalname,
    type: req.files.upfile[0].mimetype,
    size: req.files.upfile[0].size,
  });
});

app.get("/test", (req, res) => res.status(200).json("yay"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
