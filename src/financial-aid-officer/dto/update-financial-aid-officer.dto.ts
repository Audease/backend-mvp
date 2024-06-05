import { PartialType } from '@nestjs/mapped-types';
import { CreateFinancialAidOfficerDto } from './create-financial-aid-officer.dto';

export class UpdateFinancialAidOfficerDto extends PartialType(
  CreateFinancialAidOfficerDto
) {}
