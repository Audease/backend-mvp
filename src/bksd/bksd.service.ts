import { Injectable } from '@nestjs/common';
import { CreateBksdDto } from './dto/create-bksd.dto';
import { UpdateBksdDto } from './dto/update-bksd.dto';

@Injectable()
export class BksdService {
  create(createBksdDto: CreateBksdDto) {
    return 'This action adds a new bksd';
  }

  findAll() {
    return `This action returns all bksd`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bksd`;
  }

  update(id: number, updateBksdDto: UpdateBksdDto) {
    return `This action updates a #${id} bksd`;
  }

  remove(id: number) {
    return `This action removes a #${id} bksd`;
  }
}
