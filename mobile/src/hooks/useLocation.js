import { useCallback, useEffect, useState } from "react";
import { getCurrentLocation } from "../services/locationService";

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getCurrentLocation();

      setLocation(data);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  return {
    location,
    loading,
    error,
    refresh,
  };
}