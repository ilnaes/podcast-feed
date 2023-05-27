import express from "express";
import passport from "passport";
import { clean_feed } from "../utils";
import { getDB } from "../db";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.authenticate("jwt", { session: false }));

app.get("/hello", async (_req, res) => {
  res.status(200).send("good");
  return;
});

app.put("/feeds", async (req, res) => {
  const feeds = getDB().collection("feeds");

  const feed = clean_feed("test", req.body);
  if (feed === null) {
    res.status(400).send("Bad format!");
    return;
  }

  let result;
  try {
    result = await feeds.updateOne(
      feed,
      { $setOnInsert: { episodes: [] } },
      { upsert: true }
    );
  } catch (err) {
    console.log(err);
    res.send(400).send("Mongo error!");
    return;
  }

  if (result === undefined || result.upsertedCount != 1) {
    res.status(400).send("User exists!");
    return;
  }

  res.status(200).send("OK");
  return;
});

export = app;
