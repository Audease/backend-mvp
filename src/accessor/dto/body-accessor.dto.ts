import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectDto {
  @IsString()
  @ApiProperty()
  reason: string;
}
