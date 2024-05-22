import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { TokenType } from '../../utils/enum/token_type';

export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', { enum: TokenType, default: TokenType.REFRESH })
  type: TokenType;

  @Column('text')
  token: string;

  @Column('boolean', { default: false })
  blacklisted: boolean;

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
