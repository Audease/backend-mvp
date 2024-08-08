import { IsString } from 'class-validator';
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
    example: 'd00dd4be-f713-4db6-a2b9-035d086989f7',
  })
  @IsString()
  permission_id: string;
}
