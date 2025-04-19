import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ArchiveRoleDto {
  @ApiProperty({
    description: 'Reason for archiving the role',
    example: 'Role is no longer needed',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}
