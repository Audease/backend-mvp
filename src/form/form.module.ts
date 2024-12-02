import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { Form } from './entity/form.entity';
import { FormSubmission } from './entity/form-submission.entity';
import { UserService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Form, FormSubmission]), UsersModule],
  controllers: [FormController],
  providers: [UserService, FormService],
  exports: [FormService],
})
export class FormModule {}
