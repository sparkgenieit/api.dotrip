"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("./constants");
const bcrypt = __importStar(require("bcryptjs"));
const constants_2 = require("../common/constants");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        let user;
        try {
            user = await this.usersService.findByEmail(email);
        }
        catch (_a) {
            return null;
        }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            return null;
        }
        const { password } = user, safeUser = __rest(user, ["password"]);
        return safeUser;
    }
    async login(user, response) {
        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload, { secret: constants_1.jwtConstants.secret });
        const refreshToken = this.jwtService.sign(payload, {
            secret: constants_1.jwtConstants.refreshSecret,
            expiresIn: '7d',
        });
        response.cookie(constants_2.JWT_ACCESS_COOKIE, accessToken, { httpOnly: true, sameSite: 'lax' });
        response.cookie(constants_2.JWT_REFRESH_COOKIE, refreshToken, { httpOnly: true, sameSite: 'lax' });
        return { accessToken };
    }
    async refresh(user, response) {
        const payload = { sub: user.sub, email: user.email };
        const accessToken = this.jwtService.sign(payload, { secret: constants_1.jwtConstants.secret });
        response.cookie(constants_2.JWT_ACCESS_COOKIE, accessToken, { httpOnly: true, sameSite: 'lax' });
        return { accessToken };
    }
    async logout(response) {
        response.clearCookie(constants_2.JWT_ACCESS_COOKIE);
        response.clearCookie(constants_2.JWT_REFRESH_COOKIE);
        return { message: 'Logged out' };
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map