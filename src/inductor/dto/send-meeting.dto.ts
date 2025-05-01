import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class SendMeetingDto {
  @ApiPropertyOptional({
    description: 'The meeting ID',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  meetingId?: string;

  @ApiPropertyOptional({
    description: 'The meeting URL',
    example: 'https://meet.google.com/123456',
  })
  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @ApiPropertyOptional({
    description: 'The meeting password',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'The meeting start time',
    example: '2024-04-27T14:00:00',
  })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'The meeting end time',
    example: '2024-04-27T15:00:00',
  })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    description:
      'Full meeting information for one-click paste (will be parsed to extract relevant information)',
    example:
      'Join Zoom Meeting\nhttps://zoom.us/j/123456789\nMeeting ID: 123 456 789\nPassword: 123456\nTime: April 27, 2024 2:00 PM - 3:00 PM',
    required: false,
  })
  @IsString()
  @IsOptional()
  meetingInfo?: string;
}
