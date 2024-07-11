import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccessorService } from './accessor.service';
import { CreateAccessorDto } from './dto/create-accessor.dto';
import { UpdateAccessorDto } from './dto/update-accessor.dto';

@Controller('accessor')
export class AccessorController {
  constructor(private readonly accessorService: AccessorService) {}

  @Post()
  create(@Body() createAccessorDto: CreateAccessorDto) {
    return this.accessorService.create(createAccessorDto);
  }

  @Get()
  findAll() {
    return this.accessorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccessorDto: UpdateAccessorDto) {
    return this.accessorService.update(+id, updateAccessorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessorService.remove(+id);
  }
}
