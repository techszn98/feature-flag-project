import { useEffect, useState } from "react";
import { getEnvironment } from "../../api/environments.api.js";

export function useFlagEnvironment(environmentId) {
  const [environment, setEnvironment] = useState(null);
  const [loading, setLoading] = useState(Boolean(environmentId));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setEnvironment(null);
    if (!environmentId) {
      setLoading(false);
      setError("");
      return () => {
        active = false;
      };
    }
    setLoading(true);
    getEnvironment(environmentId)
      .then((item) => active && setEnvironment(item))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [environmentId]);

  return { environment, loading, error };
}
