/**
 * Utility to resolve absolute API URLs when the app is hosted on external hosts like Vercel.
 */
export function getApiUrl(path: string): string {
  const isVercel =
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("github.io") ||
    (window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      !window.location.hostname.endsWith(".run.app"));

  // Check if there is an administrator API URL override in LocalStorage
  const override = localStorage.getItem("cosmo_tarot_api_override");
  if (override) {
    const cleanOverride = override.trim().replace(/\/$/, "");
    return `${cleanOverride}${path}`;
  }

  // Deployed Cloud Run container URL as fallback
  const fallbackBackend = "https://ais-pre-eoiikp2nxekhxnce2yr25y-199260145316.europe-west1.run.app";

  if (isVercel) {
    return `${fallbackBackend}${path}`;
  }
  return path;
}

/**
 * Gets the current active API URL base (for display in admin panel)
 */
export function getActiveApiBaseUrl(): string {
  const override = localStorage.getItem("cosmo_tarot_api_override");
  if (override) {
    return override.trim().replace(/\/$/, "");
  }
  
  const isVercel =
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("github.io") ||
    (window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      !window.location.hostname.endsWith(".run.app"));

  if (isVercel) {
    return "https://ais-pre-eoiikp2nxekhxnce2yr25y-199260145316.europe-west1.run.app";
  }
  
  return window.location.origin;
}
