import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsObject } from 'class-validator';
import { FormType } from '../../utils/enum/form-type';

export class CreateSubmissionDto {
  @ApiProperty({
    enum: FormType,
    description: 'The type of form being submitted',
  })
  @IsNotEmpty()
  @IsEnum(FormType)
  formType: FormType;

  @ApiProperty({
    description: 'The form data object',
    example: {
      candidateName: 'John Doe',
      courseDetails: 'Web Development',
    },
  })
  @IsObject()
  data: any;
}
