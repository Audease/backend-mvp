import { PartialType } from '@nestjs/swagger';
import { CreateAccessorDto } from './create-accessor.dto';

export class UpdateAccessorDto extends PartialType(CreateAccessorDto) {}
