import { mongoConnect, getDB, disconnect } from "../db";
import request from "supertest";
import feeds from "./feeds";
import { build_auth_get, build_auth_put } from "../utils";
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { _login, setup_auth } from "../auth";

describe("Feeds", () => {
  let token1: string;
  let token2: string;
  let app: Express.Application;
  let get: (user: string) => request.Test;
  let put: (user: string) => request.Test;

  beforeAll(async () => {
    await new Promise((res, rej) => {
      mongoConnect(
        () => {
          setup_auth();
          app = feeds();
          get = build_auth_get("/feeds", app);
          put = build_auth_put("/feeds", app);

          res("good");
        },
        (err) => rej(err)
      );
    });
    token1 = _login("test1");
    token2 = _login("test2");
  });

  afterAll(async () => {
    await getDB().collection("feeds").drop();
    await disconnect();
  });

  test("Should get authorization error", (done) => {
    request(app).get("/feeds").expect(401, done);
  });

  test("Should return empty feed", (done) => {
    get(token1)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
        return done();
      });
  });

  test("Should succeed", (done) => {
    put(token1)
      .send({
        name: "pqioweh",
        description: "QOWieqoiwbeq",
      })
      .set("Content-Type", "application/json")
      .expect(200, done);
  });

  test("Should have one result", (done) => {
    get(token1)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].user).toBe("test1");
        expect(res.body[0].name).toBe("pqioweh");
        expect(res.body[0].description).toBe("QOWieqoiwbeq");

        return done();
      });
  });

  test("Should succeed", (done) => {
    put(token2)
      .send({
        name: "qwioeqwe",
      })
      .set("Content-Type", "application/json")
      .expect(200, done);
  });

  test("Double insert with different description should fail", (done) => {
    put(token1)
      .send({
        name: "pqioweh",
        description: "qiwoneowiq",
      })
      .set("Content-Type", "application/json")
      .expect(400, done);
  });

  test("Invalid format insert should fail", (done) => {
    put(token1)
      .send({
        what: "qwbeq",
      })
      .set("Content-Type", "application/json")
      .expect(400, done);
  });

  test("Shouldn't have affected results", (done) => {
    get(token1)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].user).toBe("test1");
        expect(res.body[0].name).toBe("pqioweh");
        expect(res.body[0].description).toBe("QOWieqoiwbeq");

        return done();
      });
  });
});
