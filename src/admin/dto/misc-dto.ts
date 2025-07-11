import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';
// import { Role } from '../../utils/enum/role';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

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
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search by email or username',
    example: 'john@example.com',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by status (assigned, unassigned)',
    example: 'assigned',
    enum: ['assigned', 'unassigned'],
  })
  status?: string;
}

export class EmailDto {
  @IsString()
  @ApiProperty({
    description: 'The email of the user',
    example: 'teslimodumuyiwa@gmail.com',
  })
  email: string;
}

export class AssignRoleStaffDto {
  @IsString()
  @ApiProperty({
    description: 'The ID of the staff member',
    example: '1',
  })
  staffId: string;

  @IsString()
  @ApiProperty({
    description: 'The ID of the role to assign',
    example: '1',
  })
  roleId: string;
}

export class AssignRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AssignRoleStaffDto)
  @ApiProperty({
    description: 'Array of staff and role assignments',
    type: [AssignRoleStaffDto],
  })
  assignments: AssignRoleStaffDto[];
}
