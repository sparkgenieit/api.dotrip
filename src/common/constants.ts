// src/common/constants.ts

// Front-end origin (fallback if env var is missing)
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
export const API_URL = process.env.API_URL || 'http://localhost:3000';

// Cookie names for JWT tokens
export const JWT_ACCESS_COOKIE = 'Authentication';
export const JWT_REFRESH_COOKIE = 'Refresh';
