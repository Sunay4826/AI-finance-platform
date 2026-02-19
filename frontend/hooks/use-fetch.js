import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    setData(undefined);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      const resolvedError =
        error instanceof Error ? error : new Error("Request failed");

      console.error("[useFetch] Request failed", {
        callback: cb?.name || "anonymous",
        args,
        error,
      });

      setError(resolvedError);
      toast.error(resolvedError.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
