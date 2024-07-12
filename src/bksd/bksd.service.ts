import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../users/entities/user.entity';
import { Accessor } from '../accessor/entities/accessor.entity';
import { ProspectiveStudent } from '../recruiter/entities/prospective-student.entity';
import { UserService } from '../users/users.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Role } from '../utils/enum/role';
import { Student } from '../students/entities/student.entity';
import { MailService } from '../shared/services/mail.service';

@Injectable()
export class BksdService {
  private readonly logger = new Logger(BksdService.name);
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Accessor)
    private readonly accessorRepository: Repository<Accessor>,
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly userService: UserService,
    private readonly mailService: MailService
  ) {}

  async sendLearnerMail(userId: string, applicantId: string) {
    // check if the logged in user is an accessor
    const loggedInUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });
    if (!loggedInUser) {
      console.log('loggedIn user not found');
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const accessor = await this.accessorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['school'],
    });

    if (!accessor) {
      this.logger.error('Accessor not found for the user');
      throw new NotFoundException('Accessor not found for the user');
    }

    const learner = await this.learnerRepository.findOne({
      where: { id: applicantId, school: { id: accessor.school.id } },
      relations: ['school', 'recruiter'],
    });

    if (learner) {
      const accessorUsername = loggedInUser.username;
      const sanitizedCollegeName = accessorUsername.split('.')[1];
      const college_id = loggedInUser.school.id;
      let generated_username =
        `${learner.first_name}.${sanitizedCollegeName}.student`.toLowerCase();
      const generated_password = crypto
        .randomBytes(12)
        .toString('hex')
        .slice(0, 7);

      const role = await this.userService.getRoleByName(Role.STUDENT);

      const userExists =
        await this.userService.getUserByUsername(generated_username);

      if (userExists) {
        const randomNumber = Math.floor(Math.random() * 1000);
        generated_username =
          `${learner.first_name}${randomNumber}.${sanitizedCollegeName}.learner`.toLowerCase();
      }

      const emailExists = await this.userService.getUserByEmail(learner.email);
      if (emailExists) {
        this.logger.error('Email already exists');
        throw new ConflictException('Email already exists');
      }
      const user = await this.userService.createUserWithCollegeId(
        {
          username: generated_username,
          password: await bcrypt.hashSync(generated_password, 10),
          email: learner.email,
          phone: learner.mobile_number,
          first_name: learner.first_name,
          last_name: learner.last_name,
          role,
        },
        college_id
      );

      const student = this.studentRepository.create({
        ...learner,
        user,
        school: loggedInUser.school,
      });

      await this.studentRepository.save(student);

      const loginUrl = `${process.env.FRONTEND_URL}`;
      const first_name = learner.first_name;

      await this.mailService.sendTemplateMail(
        {
          to: learner.email,
          subject: 'Your Audease Account Has Been Created!',
        },
        'welcome-users',
        {
          first_name,
          generated_username,
          generated_password,
          loginUrl,
        }
      );

      this.logger.log('Student account created');

      await this.learnerRepository.update(learner.id, {
        application_mail: 'Sent',
      });

      this.logger.log('Mail has been sent to student');
      return { message: 'Mail sent successfully' };
    } else {
      this.logger.error('Learner not found');
      throw new NotFoundException('Learner not found');
    }
  }
}
