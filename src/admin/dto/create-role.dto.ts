import { IsString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({
    description: 'The role name to be created',
    example: 'Zilly',
  })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'The id of the permission',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids: string[];
}
