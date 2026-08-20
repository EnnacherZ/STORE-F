/**
 * server/connecter.tsx
 *
 * Shared Axios instance for all storefront (client-facing) API calls.
 * withCredentials: true ensures the httpOnly auth cookies are sent
 * on every request without any manual token management.
 */
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL as string;

export const connecter = axios.create({
  baseURL:         apiUrl,
  withCredentials: true,        // send httpOnly cookies (access_token, refresh_token)
  xsrfCookieName:  "csrftoken",
  xsrfHeaderName:  "X-CSRFToken",
});