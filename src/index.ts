// import { Storage, GetSignedUrlConfig } from "@google-cloud/storage";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import feed from "./routes/feeds";
import { mongoConnect } from "./db";
import passport from "passport";
import jwt from "jsonwebtoken";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      _id: string;
    }
  }
}

dotenv.config();
const app = express();
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET!;

// const storage = new Storage();
mongoConnect(() => {
  app.post(
    "/register",
    passport.authenticate("register", { session: false }),
    (req, res) => {
      const token = jwt.sign({ user: req.user }, JWT_SECRET);

      return res.json({ token });
    }
  );

  app.post("/login", async (req, res, next) => {
    passport.authenticate(
      "login",
      { session: false },
      async (err: Error, user: Express.User | boolean) => {
        if (err !== null || user === false) {
          return res.send("Unauthorized");
        }

        req.login(
          user as Express.User,
          { session: false },
          async (err?: Error) => {
            if (err !== undefined) {
              return res.send(err);
            }

            const token = jwt.sign({ user }, JWT_SECRET);

            return res.json({ token });
          }
        );
      }
    )(req, res, next);
  });

  // app.use("/api", passport.authenticate("jwt", { session: false }), api);
});

mongoConnect(() => {
  app.get("/hello", async (_req, res) => {
    // const options: GetSignedUrlConfig = {
    //   version: "v4",
    //   action: "write",
    //   expires: Date.now() + 1 * 60 * 1000, // 15 minutes
    //   contentType: "application/octet-stream",
    // };
    // const [url] = await storage
    //   .bucket(process.env.FEED_BUCKET || "")
    //   .file("hello")
    //   .getSignedUrl(options);

    // console.log("Generated PUT signed URL:");
    // console.log(url);

    res.send("Hello world!");
  });

  app.use("/", feed);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
