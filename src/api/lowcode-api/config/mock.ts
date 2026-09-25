// Local development config (used by `npm run mock` and offline `npm start`).
// All values are overridable via env so no internal host is baked in.
export default {
  url: process.env.DB_URL || 'mysql://localhost:3306/lowcode',
  username: process.env.DB_USER || 'lowcode',
  password: process.env.DB_PASSWORD || 'lowcode',
  SYNC_SOURCE: true,
};