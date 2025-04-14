import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
}

export class UpdateAttendanceStatusDto {
  @IsNotEmpty()
  @IsEnum(AttendanceStatus, {
    message: `attendance_status must be one of the following values: ${Object.values(
      AttendanceStatus
    ).join(', ')}`,
  })
  @ApiProperty({
    enum: AttendanceStatus,
    description: `attendance_status must be one of the following values: ${Object.values(
      AttendanceStatus
    ).join(', ')}`,
  })
  attendance_status: AttendanceStatus;
}
