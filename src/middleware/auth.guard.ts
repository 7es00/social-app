import {
  Injectable, CanActivate, ExecutionContext,
  UnauthorizedException, createParamDecorator,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () =>
  (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
    return descriptor;
  };

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const GqlCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    return gqlCtx.getContext().req.user;
  },
);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    let request: any;
    try {
      const gqlCtx = GqlExecutionContext.create(context);
      request = gqlCtx.getContext().req;
    } catch {
      request = context.switchToHttp().getRequest();
    }

    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private extractToken(request: any): string | null {
    const auth = request.headers?.authorization;
    if (auth?.startsWith('Bearer ')) return auth.substring(7);
    return request.cookies?.token || null;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let user: any;
    try {
      const gqlCtx = GqlExecutionContext.create(context);
      user = gqlCtx.getContext().req.user;
    } catch {
      user = context.switchToHttp().getRequest().user;
    }
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return true;
  }
}
