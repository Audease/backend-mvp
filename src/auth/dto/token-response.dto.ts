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

// src/auth/dto/token-response.dto.ts
export class TokenResponseDto {
  @ApiProperty({ type: AccessToken })
  access: AccessToken;

  @ApiProperty({ type: RefreshToken })
  refresh: RefreshToken;

  @ApiProperty({
    description: 'Whether the user needs to change their password',
    example: true,
    type: Boolean,
  })
  requires_password_change: boolean;

  @ApiProperty({
    description: 'List of user permissions',
    example: ['Add student', 'Manage Personal Profile'],
    type: [String],
  })
  permissions: string[];

  @ApiProperty({
    description: 'User ID',
    example: '6bb722fd-466c-4ece-bf74-71464f2162ec',
  })
  user_id: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Learner ID (only for students)',
    example: '12e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  learner_id?: string;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-04-22T15:30:45.123Z',
    required: false,
  })
  last_login_at?: string;
}
