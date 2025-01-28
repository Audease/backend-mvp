import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

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

  @ApiProperty({
    description: 'The form type to update',
    example: {
      formType: 'award_assessment',
    },
  })
  @IsString()
  formType: string;
}
