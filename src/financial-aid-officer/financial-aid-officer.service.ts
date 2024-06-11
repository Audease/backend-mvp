import { Injectable } from '@nestjs/common';
import { CreateFinancialAidOfficerDto } from './dto/create-financial-aid-officer.dto';
import { UpdateFinancialAidOfficerDto } from './dto/update-financial-aid-officer.dto';

@Injectable()
export class FinancialAidOfficerService {
  create(createFinancialAidOfficerDto: CreateFinancialAidOfficerDto) {
    return 'This action adds a new financialAidOfficer';
  }

  findAll() {
    return `This action returns all financialAidOfficer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} financialAidOfficer`;
  }

  update(
    id: number,
    updateFinancialAidOfficerDto: UpdateFinancialAidOfficerDto
  ) {
    return `This action updates a #${id} financialAidOfficer`;
  }

  remove(id: number) {
    return `This action removes a #${id} financialAidOfficer`;
  }
}
