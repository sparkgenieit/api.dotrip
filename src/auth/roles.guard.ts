import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the @Roles metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Extract the user from the request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Debug log
    this.logger.debug(`Required roles: ${requiredRoles}`);
    this.logger.debug(`User role: ${user?.role}`);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Check if the user's role is allowed
    const hasRole = requiredRoles.includes(user?.role);
    if (!hasRole) {
      this.logger.warn(
        `Access denied: user role '${user?.role}' not in [${requiredRoles.join(', ')}]`,
      );
    }
    return hasRole;
  }
}
