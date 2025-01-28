import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { FormType } from '../../utils/enum/form-type';

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
    enum: FormType,
    description: 'The type of form being submitted',
  })
  @IsNotEmpty()
  @IsEnum(FormType)
  formType: FormType;
}
