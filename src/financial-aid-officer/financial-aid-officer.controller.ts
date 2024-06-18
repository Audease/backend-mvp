import {
  Controller,
  // Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
// import { FinancialAidOfficerService } from './financial-aid-officer.service';
// import { CreateFinancialAidOfficerDto } from './dto/create-financial-aid-officer.dto';
// import { UpdateFinancialAidOfficerDto } from './dto/update-financial-aid-officer.dto';

@Controller('financial-aid-officer')
export class FinancialAidOfficerController {
  // constructor(
  //   private readonly financialAidOfficerService: FinancialAidOfficerService
  // ) {}

  // @Post()
  // create(@Body() createFinancialAidOfficerDto: CreateFinancialAidOfficerDto) {
  //   return this.financialAidOfficerService.create(createFinancialAidOfficerDto);
  // }

  // @Get()
  // findAll() {
  //   return this.financialAidOfficerService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.financialAidOfficerService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateFinancialAidOfficerDto: UpdateFinancialAidOfficerDto
  // ) {
  //   return this.financialAidOfficerService.update(
  //     +id,
  //     updateFinancialAidOfficerDto
  //   );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.financialAidOfficerService.remove(+id);
  // }
}
