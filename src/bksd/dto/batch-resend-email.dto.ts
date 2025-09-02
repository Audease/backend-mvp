import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class BatchResendMailDto {
  @ApiProperty({
    description: 'Array of learner IDs to resend emails to',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '456e7890-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one learner ID is required' })
  @ArrayMaxSize(50, { message: 'Maximum 50 learners can be processed at once' })
  @IsUUID('4', { each: true, message: 'Each learner ID must be a valid UUID' })
  learnerIds: string[];
}
