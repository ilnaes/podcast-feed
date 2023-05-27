import { mongoConnect, getDB, disconnect } from "../db";
import request from "supertest";
import feeds from "./feeds";
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { _login, setup_auth } from "../auth";

describe("Feeds", () => {
  let token1: string;
  let token2: string;
  let app: Express.Application;

  beforeAll(async () => {
    await new Promise((res, rej) => {
      mongoConnect(
        () => {
          setup_auth();
          res("good");
          app = feeds();
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
    request(app)
      .get("/feeds")
      .set("Authorization", `Bearer ${token1}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .set("Accept", "application/json")
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
    request(app)
      .put("/feeds")
      .set("Authorization", `Bearer ${token1}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .send({
        name: "pqioweh",
        description: "QOWieqoiwbeq",
      })
      .set("Content-Type", "application/json")
      .expect(200, done);
  });

  test("Should have one result", (done) => {
    request(app)
      .get("/feeds")
      .set("Authorization", `Bearer ${token1}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
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
    request(app)
      .put("/feeds")
      .set("Authorization", `Bearer ${token2}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .send({
        name: "qwioeqwe",
      })
      .set("Content-Type", "application/json")
      .expect(200)
      .end((err, _res) => {
        if (err) return done(err);
        return done();
      });
  });

  test("Shouldn't have affected results", (done) => {
    request(app)
      .get("/feeds")
      .set("Authorization", `Bearer ${token1}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].user).toBe("test1");
        expect(res.body[0].name).toBe("pqioweh");

        return done();
      });
  });

  test("Double insert should fail", (done) => {
    request(app)
      .put("/feeds")
      .set("Authorization", `Bearer ${token1}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .send({
        name: "pqioweh",
        description: "qiwoneowiq",
      })
      .set("Content-Type", "application/json")
      .expect(400, done);
  });

  test("Invalid format insert should fail", (done) => {
    request(app)
      .put("/feeds")
      .set("Authorization", `Bearer ${token1}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .send({
        what: "qwbeq",
      })
      .set("Content-Type", "application/json")
      .expect(400, done);
  });
});
