# JavaScript SDK (Preview)

This dependency-free SDK wraps the feature-flag management endpoints. It does not perform runtime evaluation; use `POST /api/v1/evaluate` with an environment key for server-side evaluation. Flags reference an `environmentId` and are scoped to its owning project.

## Install from This Repository

From a JavaScript application in this repository, install the local package:

```sh
npm install ./backend/sdk/javascript
```

Or use a workspace-relative `file:` dependency appropriate to your app's location. The SDK requires Node.js 18 or a browser with `fetch`, `Headers`, and `URLSearchParams`.

## Use

```js
import { ApiClient, createFlagsApi } from "@feature-flag-api/javascript";

const client = new ApiClient({
  baseUrl: "http://localhost:3000/api/v1",
  accessToken: () => session.accessToken,
});
const flags = createFlagsApi(client);

const productionFlags = await flags.list({
  environmentId: "673f4b28198f123456789abc",
});
const flag = await flags.create({
  name: "new_checkout",
  environmentId: "673f4b28198f123456789abc",
  enabled: false,
});
await flags.update(flag.id, { enabled: true });
await flags.remove(flag.id);
```

`accessToken` can be a token string or a function that returns the current token. `ApiError` exposes the HTTP `status` and parsed response `payload`.

## React Example

Pass the access token from your application's existing authentication state. This example lists flags for one environment and handles component unmounts; it is an integration example, not a bundled demo application.

```jsx
import { useEffect, useState } from "react";
import { ApiClient, createFlagsApi } from "@feature-flag-api/javascript";

export function ProductionFlags({ accessToken }) {
  const [flags, setFlags] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const api = createFlagsApi(
      new ApiClient({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        accessToken,
      }),
    );

    api
      .list({ environmentId: import.meta.env.VITE_PRODUCTION_ENVIRONMENT_ID })
      .then((items) => {
        if (active) setFlags(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  if (error) return <p role="alert">{error}</p>;
  return (
    <ul>
      {flags.map((flag) => (
        <li key={flag.id}>
          {flag.name}: {flag.enabled ? "enabled" : "disabled"}
        </li>
      ))}
    </ul>
  );
}
```

Use HTTPS in production and do not persist access or refresh tokens in browser local storage by default. See the API [authentication](../../docs/AUTHENTICATION.md) and [security](../../docs/SECURITY.md) notes.
