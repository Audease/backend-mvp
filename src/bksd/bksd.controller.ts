import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BksdService } from './bksd.service';
import { CreateBksdDto } from './dto/create-bksd.dto';
import { UpdateBksdDto } from './dto/update-bksd.dto';

@Controller('bksd')
export class BksdController {
  constructor(private readonly bksdService: BksdService) {}

  @Post()
  create(@Body() createBksdDto: CreateBksdDto) {
    return this.bksdService.create(createBksdDto);
  }

  @Get()
  findAll() {
    return this.bksdService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bksdService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBksdDto: UpdateBksdDto) {
    return this.bksdService.update(+id, updateBksdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bksdService.remove(+id);
  }
}
