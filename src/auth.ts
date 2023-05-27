import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { getDB } from "./db";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

export function setup_auth() {
  const conn = getDB();

  passport.use(
    new JWTStrategy(
      {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        // possibly check if user is still present in db
        return done(null, token.user);
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(async (username, password, done) => {
      const users = conn.collection("users");

      let user;
      try {
        user = await users.findOne({ username });
        if (!user) {
          return done(null, false);
        }
      } catch (err) {
        return done(err);
      }

      if (await bcrypt.compare(password, user.password)) {
        return done(null, { _id: user._id.toString() });
      } else {
        return done(null, false);
      }
    })
  );

  passport.use(
    "register",
    new LocalStrategy(async (username, password, done) => {
      const users = conn.collection("users");

      let result;
      try {
        const hashed = await bcrypt.hash(password, 10);
        result = await users.findOneAndUpdate(
          { username },
          { $setOnInsert: { password: hashed } },
          { upsert: true, returnDocument: "after" }
        );

        if (result.value === null) {
          return done(null, false);
        }
        if (result.value.password !== hashed) {
          return done(null, false);
        }
      } catch (err) {
        return done(err);
      }

      return done(null, { _id: result.value._id.toString() });
    })
  );
}

export function _login(_id = "test"): string {
  return jwt.sign({ user: { _id } }, JWT_SECRET);
}
