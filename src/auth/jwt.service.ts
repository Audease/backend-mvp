import { JwtService, JsonWebTokenError } from '@nestjs/jwt';
import { Token } from '../shared/entities/token.entity';
import {
  TokenPayload,
  TokenResponse,
} from '../utils/interface/token.interface';
import { TokenType } from '../utils/enum/token_type';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtAuthService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(payload: TokenPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  async saveToken(
    token: string,
    userId: string,
    expiresIn: Date,
    type: TokenType,
  ) {
    return this.tokenRepository.save({
      token,
      userId,
      expires: expiresIn,
      type,
    });
  }

  async generateAuthTokens(
    userId: string,
    roleId: string,
  ): Promise<TokenResponse> {
    const accessTokenExpires = moment()
      .add(process.env.JWT_ACCESS_EXPIRES_IN, 'minutes')
      .toDate();
    const refreshTokenExpires = moment()
      .add(process.env.JWT_REFRESH_EXPIRES_IN, 'days')
      .toDate();

    const accessToken = await this.generateToken({
      sub: userId,
      role_id: roleId,
      exp: moment(accessTokenExpires).unix(),
      iat: moment().unix(),
      type: TokenType.ACCESS,
    });

    const refreshToken = await this.generateToken({
      sub: userId,
      role_id: roleId,
      exp: moment(refreshTokenExpires).unix(),
      iat: moment().unix(),
      type: TokenType.REFRESH,
    });

    await this.saveToken(
      refreshToken,
      userId,
      refreshTokenExpires,
      TokenType.REFRESH,
    );

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires,
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires,
      },
    };
  }

  async generateAccessToken(userId: string, roleId: string) {
    const expiresIn = moment()
      .add(process.env.JWT_ACCESS_EXPIRES_IN, 'minutes')
      .toDate();

    return this.generateToken({
      sub: userId,
      role_id: roleId,
      exp: moment(expiresIn).unix(),
      iat: moment().unix(),
      type: TokenType.ACCESS,
    });
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async verifyRefreshToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    const tokenExists = await this.getToken(token);

    if (!tokenExists) {
      throw new JsonWebTokenError('Invalid token');
    }
    return payload;
  }

  async invalidateToken(token: string) {
    return this.tokenRepository.update(
      { token },
      { blacklisted: true, updatedAt: new Date() },
    );
  }

  async getToken(token: string) {
    return this.tokenRepository.findOne({ where: { token } });
  }

  async deleteToken(token: string) {
    return this.tokenRepository.delete({ token });
  }
}
