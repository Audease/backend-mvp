import { ApiProperty } from '@nestjs/swagger';

class AccessToken {
  @ApiProperty({
    description: 'Access token string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YmI3MjJmZC00NjZjLTRlY2UtYmY3NC03MTQ2NGYyMTYyZWMiLCJyb2xlX2lkIjoiMDcxODZhMDktOGNlZC00ZTZjLWFmY2EtNTRkMjI2NTk2MzYzIiwiZXhwIjoxNzE2NzUyMTA1LCJpYXQiOjE3MTY3NTEyMDUsInR5cGUiOiJhY2Nlc3MifQ.JRid7DqrU78WzTjO77HMFoHwalzIONjaNyIQStaWe3Y',
  })
  token: string;

  @ApiProperty({
    description: 'Expiration date of the access token',
    example: '2024-05-26T19:35:05.506Z',
  })
  expires: string;
}

class RefreshToken {
  @ApiProperty({
    description: 'Refresh token string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YmI3MjJmZC00NjZjLTRlY2UtYmY3NC03MTQ2NGYyMTYyZWMiLCJyb2xlX2lkIjoiMDcxODZhMDktOGNlZC00ZTZjLWFmY2EtNTRkMjI2NTk2MzYzIiwiZXhwIjoxNzE3MzU2MDA1LCJpYXQiOjE3MTY3NTEyMDUsInR5cGUiOiJyZWZyZXNoIn0.df3ZpU4yXy2e9UFA8kxBJsE36oaZRESP-alHPGQ6JCg',
  })
  token: string;

  @ApiProperty({
    description: 'Expiration date of the refresh token',
    example: '2024-06-02T19:20:05.507Z',
  })
  expires: string;
}

export class TokenResponseDto {
  @ApiProperty({ type: AccessToken })
  access: AccessToken;

  @ApiProperty({ type: RefreshToken })
  refresh: RefreshToken;
}
