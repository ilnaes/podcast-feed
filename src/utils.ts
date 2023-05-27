import request from "supertest";

interface Episode {
  user: string;
  name: string;
  url: string;
  feed: string;
  description?: string;
}

interface Feed {
  user: string;
  name: string;
  description?: string;
  episodes?: string[];
}

export function build_auth_get(route: string, app: Express.Application) {
  return (user: string) => {
    return request(app)
      .get(route)
      .set("Authorization", `Bearer ${user}`) //set header for this test
      .set("Content-Type", "application/json") //set header for this test
      .set("Accept", "application/json");
  };
}

export function build_auth_put(route: string, app: Express.Application) {
  return (user: string) => {
    return request(app)
      .put(route)
      .set("Authorization", `Bearer ${user}`) //set header for this test
      .set("Content-Type", "application/json"); //set header for this test
  };
}

export function clean_feed(
  user: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any,
  identifier = false
): Feed | null {
  if (!("name" in json) || typeof json["name"] !== "string") {
    return null;
  }

  if (json["name"].trim().length === 0) {
    return null;
  }

  const res: Feed = {
    user,
    name: json["name"],
  };

  if (identifier) {
    // doing deletion
    return res;
  }

  if ("description" in json) {
    if (typeof json["description"] !== "string") return null;

    res["description"] = json["description"];
  }

  let eps: string[] = [];

  if ("episodes" in json) {
    if (!Array.isArray(json["episodes"])) {
      return null;
    }

    for (const x of json["episodes"]) {
      if (typeof x !== "string") {
        return null;
      }
    }

    eps = json["episodes"];
  }

  res["episodes"] = eps;
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clean_episode(user: string, json: any): Episode | null {
  return null;
}
