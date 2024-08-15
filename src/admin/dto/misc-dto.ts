import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Role } from '../../utils/enum/role';
import { Type } from 'class-transformer';

export class param {
  @IsString()
  id: string;
}

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  limit?: number = 10;
}

export class EmailDto {
  @IsString()
  @ApiProperty({
    description: 'The email of the user',
    example: 'teslimodumuyiwa@gmail.com',
  })
  email: string;
}

export class AssignRoleDto {
  @IsString()
  @ApiProperty({
    description: 'The user id of the user',
    example: '1',
  })
  userId: string;

  @IsString()
  @ApiProperty({
    description: 'The name of the role to assign',
    example: '1',
  })
  role: Role;
}
