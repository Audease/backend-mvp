import { Injectable } from '@nestjs/common';
import { CreateAccessorDto } from './dto/create-accessor.dto';
import { UpdateAccessorDto } from './dto/update-accessor.dto';

@Injectable()
export class AccessorService {
  create(createAccessorDto: CreateAccessorDto) {
    return 'This action adds a new accessor';
  }

  findAll() {
    return `This action returns all accessor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accessor`;
  }

  update(id: number, updateAccessorDto: UpdateAccessorDto) {
    return `This action updates a #${id} accessor`;
  }

  remove(id: number) {
    return `This action removes a #${id} accessor`;
  }
}
