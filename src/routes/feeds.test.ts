import { mongoConnect, getDB, disconnect } from "../db";
import request from "supertest";
import app from "./feeds";
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { _login, setup_auth } from "../auth";

describe("Feeds", () => {
  let token: string;

  beforeAll(async () => {
    await new Promise((res, rej) => {
      mongoConnect(
        () => {
          setup_auth();
          res("good");
        },
        (err) => rej(err)
      );
    });
    token = _login();
  });

  afterAll(async () => {
    await getDB().collection("feeds").drop();
    await disconnect();
  });

  test("JWT works", (done) => {
    request(app)
      .get("/hello")
      .set("Authorization", `Bearer ${token}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .expect(200)
      .end((err, _res) => {
        if (err) return done(err);
        return done();
      });
  });

  test("PUT /feeds", (done) => {
    request(app)
      .put("/feeds")
      .set("Authorization", `Bearer ${token}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .send({
        name: "pqioweh",
      })
      .set("Content-Type", "application/json")
      .expect(200)
      .end((err, _res) => {
        if (err) return done(err);
        return done();
      });
  });

  test("check user", async () => {
    expect(await getDB().collection("feeds").countDocuments()).toBe(1);
  });

  // test("env", async () => {
  //   const db = getDB();
  //   expect(await db.databaseName).toBe("test");
  // });

  // test("clear", async () => {
  //   const db = getDB();
  //   const coll = db.collection("foo");
  //   expect(await coll.countDocuments()).toBe(0);

  //   await coll.insertOne({ foo: "BAR" });
  //   expect(await coll.countDocuments()).toBe(1);
  // });
});
