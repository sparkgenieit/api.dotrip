"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET || 'jwt_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret',
};
//# sourceMappingURL=constants.js.map