import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { SubmissionStatus } from '../../utils/enum/submission-status';

export class ReviewSubmissionDto {
  @ApiProperty({
    enum: SubmissionStatus,
    description: 'The review status for the submission',
  })
  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @ApiPropertyOptional({
    description: 'Optional review comment',
    example: 'All requirements met',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
