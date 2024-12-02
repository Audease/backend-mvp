import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateSubmissionDto {
  @ApiProperty({
    description: 'The updated form data object',
    example: {
      candidateName: 'John Doe',
      courseDetails: 'Web Development',
    },
  })
  @IsObject()
  data: any;
}
