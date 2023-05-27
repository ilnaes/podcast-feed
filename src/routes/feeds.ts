import express from "express";
import passport from "passport";
import { clean_feed } from "../utils";
import { getDB } from "../db";

export = function feed_routes() {
  const app = express();
  const feeds = getDB().collection("feeds");

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(passport.authenticate("jwt", { session: false }));

  app.get("/feeds", async (req, res) => {
    const cursor = feeds.find({ user: req.user!._id });
    let result;
    try {
      result = await cursor.toArray();
    } catch (err) {
      console.log(err);
      res.status(400).send("Mongo error!");
      return;
    }

    res.json(result);
  });

  app.put("/feeds", async (req, res) => {
    const feed = clean_feed(req.user!._id, req.body);
    if (feed === null) {
      res.status(400).send("Bad format!");
      return;
    }

    let result;
    const description = "description" in feed ? feed["description"] : "";
    delete feed["description"];

    try {
      result = await feeds.updateOne(
        feed,
        { $setOnInsert: { episodes: [], description } },
        { upsert: true }
      );
    } catch (err) {
      console.log(err);
      res.status(400).send("Mongo error!");
      return;
    }

    if (result === undefined || result.upsertedCount != 1) {
      res.status(400).send("Feed exists!");
      return;
    }

    res.status(200).send("OK");
    return;
  });
  return app;
};
