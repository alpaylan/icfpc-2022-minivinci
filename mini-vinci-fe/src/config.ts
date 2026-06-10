const config = {
  // Base URL of the backend API (Fly.io, localhost, ...).
  API_URL: process.env.REACT_APP_API_URL,
  // Public base URL serving the problem assets (imageframes/*). Defaults to the
  // original bucket via its still-live path-style S3 URL; override with
  // REACT_APP_ASSETS_BASE_URL to point at your own R2/mirror.
  ASSETS_BASE_URL: (
    process.env.REACT_APP_ASSETS_BASE_URL ||
    'https://s3.amazonaws.com/cdn.robovinci.xyz'
  ).replace(/\/+$/, ''),
};

export default config;
