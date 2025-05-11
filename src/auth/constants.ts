export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'jwt_secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret',
};
