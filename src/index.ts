import { Storage, GetSignedUrlConfig } from "@google-cloud/storage";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const storage = new Storage();

app.get("/hello", async (req, res) => {
  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "write",
    expires: Date.now() + 10 * 60 * 1000, // 15 minutes
    contentType: "application/octet-stream",
  };
  const [url] = await storage
    .bucket(process.env.FEED_BUCKET || "")
    .file("hello")
    .getSignedUrl(options);

  console.log("Generated PUT signed URL:");
  console.log(url);

  res.send("Hello world!");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
