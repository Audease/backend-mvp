import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SendMeetingDto {
  @ApiProperty({
    description: 'The meeting ID',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  meetingId: string;

  @ApiProperty({
    description: 'The meeting URL',
    example: 'https://meet.google.com/123456',
  })
  @IsString()
  meetingUrl: string;

  @ApiProperty({
    description: 'The meeting password',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({
    description: 'The meeting start time',
    example: '2021-09-27T14:00:00',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'The meeting end time',
    example: '2021-09-27T15:00:00',
  })
  @IsString()
  endTime: string;
}
