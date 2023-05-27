import { mongoConnect, getDB, disconnect } from "./db";
import { describe, expect, test } from "@jest/globals";

describe("MongoDB", () => {
  test("setup", async () => {
    await expect(
      new Promise((res, rej) => {
        mongoConnect(
          () => {
            res("good");
            const db = getDB();
            expect(db.databaseName).toBe("test");
          },
          (err) => {
            rej(err);
          }
        );
      })
    ).resolves.not.toThrow();
  });

  test("clear", async () => {
    const db = getDB();
    const coll = db.collection("foo");
    expect(await coll.countDocuments()).toBe(0);

    await coll.insertOne({ foo: "BAR" });
    expect(await coll.countDocuments()).toBe(1);
  });

  test("teardown", async () => {
    await expect(getDB().collection("foo").drop()).resolves.not.toThrow();
    await expect(disconnect()).resolves.not.toThrow();
  });
});
