/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { clean_feed } from "./utils";
import { expect, test } from "@jest/globals";

const empty = {};
const valid_feed = {
  name: "hello",
  episodes: ["aosidb", "oiqwbeo"],
  extra: "hello",
};

test("empty", () => {
  expect(clean_feed("oiwqhe", empty)).toBeNull();
});

test("null name", () => {
  expect(clean_feed("qiowe", { name: " \t", episodes: [] })).toBeNull();
});

test("invalid episodes", () => {
  expect(
    clean_feed("qoehq", { name: "qoweh", episodes: ["qsdnqw", 1] })
  ).toBeNull();
});

test("valid", () => {
  const user = "oiqwebqo";
  let res = clean_feed(user, valid_feed);

  expect(res).not.toBeNull();
  res = res!;

  expect(res["user"]).toBe(user);

  expect(res["episodes"]).not.toBeNull();
  expect(res["episodes"]!.length).toBe(2);

  expect("extra" in res).toBe(false);
});
