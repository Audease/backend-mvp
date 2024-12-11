import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsObject, IsUUID } from 'class-validator';
import { FormType } from '../../utils/enum/form-type';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'The student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

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
