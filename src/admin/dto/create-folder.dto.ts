import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createFolder {
  @ApiProperty({
    description: 'The folder name to be created',
    example: 'Zilly',
  })
  @IsString()
  folder: string;
}

export class moveLogs {
  // Move logs from one folder to another as an array of log ids
  @ApiProperty({
    description: 'Array of log ids to be moved',
    example: ['1', '2', '3'],
  })
  @IsString({ each: true })
  logs: string[];

  @ApiProperty({
    description: 'The folder id to move the logs to',
    example: '1',
  })
  @IsString()
  folderId: string;
}

export class editLogs {
  // Edit logs
  @ApiProperty({
    description: 'Log Identifier',
    example: '1',
  })
  @IsString()
  logId: string;

  @ApiProperty({
    description: 'Log Message',
    example: 'User logged in',
  })
  @IsString()
  message: string;
}
