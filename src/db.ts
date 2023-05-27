import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let _db: MongoClient;

export function mongoConnect(cb: () => void, on_err = console.log) {
  const client = new MongoClient(process.env.MONGO_URI || "");
  client
    .connect()
    .then((conn: MongoClient) => {
      _db = conn;
      cb();
    })
    .catch((err) => {
      console.log(err);
      on_err(err);
    });
}

export function getDB() {
  return process.env.NODE_ENV === "test" ? _db.db("test") : _db.db("podcast");
}

export async function disconnect() {
  await _db.close();
}
