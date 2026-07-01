import { useState } from "react";
import { runAnalysis } from "../api/projectAnalysis";
import { ProjectData } from "../types";

export function useWorkflow() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const startWorkflow = async (
    payload: {
      text: string;
      file: { name: string; base64: string; mimeType: string } | null;
    },
    signal?: AbortSignal
  ): Promise<ProjectData> => {
    setLoading(true);
    setError(null);
    try {
      const result = await runAnalysis(
        payload,
        (newStatus) => {
          setStatus(newStatus);
        }
      );
      setLoading(false);
      return result;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An error occurred during workflow execution.";
      setError(errMsg);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    status,
    error,
    startWorkflow,
  };
}
