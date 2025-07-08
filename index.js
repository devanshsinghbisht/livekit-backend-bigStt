const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { startRecording, stopRecording } = require("../recording");

require("dotenv").config();

// const cors = require("cors")
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
require("dotenv").config();
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));
// app.use(cors())

app.post("/start-recording", async (req, res) => {
  await startRecording(req.body.roomName);
  res.send({
    message: "Success",
  });
});

app.post("/stop-recording", async (req, res) => {
  const result = await stopRecording(req.body.egressId);
  res.send(result);
});

app.listen(PORT, () => {
  console.log("App Started on ", PORT);
});
