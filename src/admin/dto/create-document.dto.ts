import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'The name of the file to be uploaded',
    example: 'file.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'The type of the file to be uploaded',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({
    description: 'The public URL of the file to be uploaded',
    example: 'https://www.example.com/file.pdf',
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  publicUrl: string;
}
