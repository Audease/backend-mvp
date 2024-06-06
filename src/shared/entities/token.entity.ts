import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { TokenType } from '../../utils/enum/token_type';
import { ApiProperty } from '@nestjs/swagger';

@Entity('token')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The type of token',
    example: 'AccessToken',
  })
  @Column('enum', { enum: TokenType, default: TokenType.REFRESH })
  type: TokenType;

  @ApiProperty({
    description: 'Token string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YmI3MjJmZC00NjZjLTRlY2UtYmY3NC03MTQ2NGYyMTYyZWMiLCJyb2xlX2lkIjoiMDcxODZhMDktOGNlZC00ZTZjLWFmY2EtNTRkMjI2NTk2MzYzIiwiZXhwIjoxNzE2NzUyMTA1LCJpYXQiOjE3MTY3NTEyMDUsInR5cGUiOiJhY2Nlc3MifQ.JRid7DqrU78WzTjO77HMFoHwalzIONjaNyIQStaWe3Y',
  })
  @Column('text')
  token: string;

  @Column('boolean', { default: false })
  blacklisted: boolean;

  @ApiProperty({
    description: 'Expiration date of the token',
    example: '2024-06-02T19:20:05.507Z',
  })
  @Column('timestamp with time zone')
  expires: Date;

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;
}
