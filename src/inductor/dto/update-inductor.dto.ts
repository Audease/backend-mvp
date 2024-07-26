import { PartialType } from '@nestjs/swagger';
import { CreateInductorDto } from './create-inductor.dto';

export class UpdateInductorDto extends PartialType(CreateInductorDto) {}
