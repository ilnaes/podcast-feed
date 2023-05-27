import { mongoConnect, getDB, disconnect } from "./db";
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";

describe("MongoDB", () => {
  beforeAll(async () => {
    await new Promise((res, rej) => {
      mongoConnect(() => {
        res("good");
      });
    });
  });

  afterAll(async () => {
    await getDB().collection("foo").drop();
    await disconnect();
  });

  test("env", async () => {
    const db = getDB();
    expect(await db.databaseName).toBe("test");
  });

  test("clear", async () => {
    const db = getDB();
    const coll = db.collection("foo");
    expect(await coll.countDocuments()).toBe(0);

    await coll.insertOne({ foo: "BAR" });
    expect(await coll.countDocuments()).toBe(1);
  });
});
