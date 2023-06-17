import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private authService: AuthService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromRequest(request); 

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET
      });

      const user = await this.authService.findUserById(payload.id);

      if (!user) {
        throw new UnauthorizedException('user not registered');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('user inactive');
      }

      request['user'] = user;

    } catch (e) {
      console.log(e)
      throw new UnauthorizedException();
    }

    return Promise.resolve(true);
  }

  extractTokenFromRequest(request) {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }

}
