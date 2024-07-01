// import {
//   BadRequestException,
//   UnauthorizedException,
//   Injectable,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { UserService } from '../users/users.service';
// import * as dotenv from 'dotenv';
// import { AuthService } from './auth.service';

// dotenv.config();

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     public readonly userService: UserService,
//     public readonly configService: ConfigService,
//     private readonly authService: AuthService
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET,
//     });
//   }

//   async validate(payload: any) {
//     if (Date.now() >= payload.exp * 1000) {
//       throw new BadRequestException();
//     }

//     const user = await this.userService.findOne(payload.sub);

//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     // const userRole = await this.userService.getUserRoleById(user.id);

//     // return { ...user, ...userRole, roles: [userRole.role] };

//     return { ...user, role: user.role.id };
//   }
// }

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const userRole = await this.userService.getUserRoleById(user.id);

    return { ...user, role: userRole.role };
  }
}
