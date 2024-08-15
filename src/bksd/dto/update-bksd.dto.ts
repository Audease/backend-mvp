import { PartialType } from '@nestjs/swagger';
import { CreateBksdDto } from './create-bksd.dto';

export class UpdateBksdDto extends PartialType(CreateBksdDto) {}
