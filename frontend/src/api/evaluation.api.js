import { api } from "./client.js";

// Runtime call: authenticates with the Environment Key only (no JWT).
// Returns { environmentId, identifier, flags }, where flags maps name -> boolean.
export async function evaluate(environmentKey, identifier) {
  return (
    await api.post(
      "/evaluate",
      { identifier },
      {
        auth: false,
        headers: { "X-Environment-Key": environmentKey },
      },
    )
  ).data;
}