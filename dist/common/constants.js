"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_REFRESH_COOKIE = exports.JWT_ACCESS_COOKIE = exports.API_URL = exports.FRONTEND_URL = void 0;
exports.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
exports.API_URL = process.env.API_URL || 'http://localhost:3000';
exports.JWT_ACCESS_COOKIE = 'Authentication';
exports.JWT_REFRESH_COOKIE = 'Refresh';
//# sourceMappingURL=constants.js.map