import {
  Controller,
  
} from '@nestjs/common';
import { RecruiterService } from './recruiter.service';


@Controller('recruiter')
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService) {}

  // @Post()
  // create(@Body() createRecruiterDto: CreateRecruiterDto) {
  //   return this.recruiterService.create(createRecruiterDto);
  // }

  // @Get()
  // findAll() {
  //   return this.recruiterService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.recruiterService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateRecruiterDto: UpdateRecruiterDto,
  // ) {
  //   return this.recruiterService.update(+id, updateRecruiterDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.recruiterService.remove(+id);
  // }
}
