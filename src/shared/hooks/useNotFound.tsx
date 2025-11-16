import { useNavigate } from "react-router-dom";
import { useRef } from "react";

/**
 * Hook to trigger a redirect to the 404 page
 * This replaces Next.js's notFound() function
 */
export function useNotFound() {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  return () => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      navigate("/404", { replace: true });
    }
  };
}
