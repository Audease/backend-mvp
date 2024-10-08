// import {
//   ConflictException,
//   Injectable,
//   Logger,
//   NotFoundException,
// } from '@nestjs/common';
// import { CreateAccountDto } from './dto/create-create-account.dto';
// import * as crypto from 'crypto';
// import * as bcrypt from 'bcrypt';
// import { AccountRepository } from './account.repository';
// import { UserService } from '../users/users.service';
// import { Role } from '../utils/enum/role';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Recruiter } from '../recruiter/entities/recruiter.entity';
// import { Repository } from 'typeorm';
// import { FinancialAidOfficer } from '../financial-aid-officer/entities/financial-aid-officer.entity';
// import { MailService } from '../shared/services/mail.service';
// import { Student } from '../students/entities/student.entity';
// import { RedisService } from '../shared/services/redis.service';
// import { Users } from '../users/entities/user.entity';
// import { Accessor } from '../accessor/entities/accessor.entity';
// import { CreateLearnerDto } from '../recruiter/dto/create-learner.dto';

// @Injectable()
// export class CreateAccountsService {
//   private readonly logger = new Logger(CreateAccountsService.name);
//   constructor(
//     private readonly accountRepository: AccountRepository,
//     private readonly userService: UserService,
//     private readonly mailService: MailService,
//     private redisService: RedisService,
//     @InjectRepository(FinancialAidOfficer)
//     private readonly financialAidOfficerRepository: Repository<FinancialAidOfficer>,
//     @InjectRepository(Recruiter)
//     private readonly recruiterRepository: Repository<Recruiter>,
//     @InjectRepository(Users)
//     private readonly userRepository: Repository<Users>,
//     @InjectRepository(Student)
//     private readonly studentRepository: Repository<Student>,
//     @InjectRepository(Accessor)
//     private readonly accessorRepository: Repository<Accessor>
//   ) {}

//   get redis() {
//     return this.redisService.getClient();
//   }

//   async addRecruiter(userId: string, createUserDto: CreateAccountDto) {
//     const admin = await this.accountRepository.findAdmin(userId);
//     if (!admin) {
//       this.logger.error('User not found');
//       throw new NotFoundException('User not found');
//     }

//     const college_id = admin.school.id;
//     const adminUsername = admin.username;
//     const sanitizedCollegeName = adminUsername.split('.')[1];
//     let generated_username =
//       `${createUserDto.first_name}.${sanitizedCollegeName}.recruiter`.toLowerCase();
//     const generated_password = crypto
//       .randomBytes(12)
//       .toString('hex')
//       .slice(0, 7);

//     const role = await this.userService.getRoleByName(Role.SCHOOL_RECRUITER);

//     const userExists =
//       await this.userService.getUserByUsername(generated_username);

//     if (userExists) {
//       const randomNumber = Math.floor(Math.random() * 1000);
//       generated_username =
//         `${createUserDto.first_name}${randomNumber}.${sanitizedCollegeName}.recruiter`.toLowerCase();
//     }

//     const emailExists = await this.userService.getUserByEmail(
//       createUserDto.email
//     );
//     if (emailExists) {
//       this.logger.error('Email already exists');
//       throw new ConflictException('Email already exists');
//     }

//     const user = await this.userService.createUserWithCollegeId(
//       {
//         username: generated_username,
//         password: await bcrypt.hashSync(generated_password, 10),
//         email: createUserDto.email,
//         phone: createUserDto.phone,
//         first_name: createUserDto.first_name,
//         last_name: createUserDto.last_name,
//         role,
//       },
//       college_id
//     );

//     const recruiter = this.recruiterRepository.create({
//       ...createUserDto,
//       user,
//       school: admin.school,
//     });

//     await this.recruiterRepository.save(recruiter);

//     const loginUrl = `${process.env.FRONTEND_URL}`;
//     const first_name = createUserDto.first_name;

//     await this.mailService.sendTemplateMail(
//       {
//         to: createUserDto.email,
//         subject: 'Your Audease Account Has Been Created!',
//       },
//       'welcome-users',
//       {
//         first_name,
//         generated_username,
//         generated_password,
//         loginUrl,
//       }
//     );

//     this.logger.log('Recruiter account created');
//     return {
//       message: 'User created successfully',
//     };
//   }

//   async addFinancialAidOfficer(
//     userId: string,
//     createUserDto: CreateAccountDto
//   ) {
//     const admin = await this.accountRepository.findAdmin(userId);
//     if (!admin) {
//       this.logger.error('User not found');
//       throw new NotFoundException('User not found');
//     }

//     const adminUsername = admin.username;
//     const sanitizedCollegeName = adminUsername.split('.')[1];
//     const college_id = admin.school.id;
//     let generated_username =
//       `${createUserDto.first_name}.${sanitizedCollegeName}.finance`.toLowerCase();
//     const generated_password = crypto
//       .randomBytes(12)
//       .toString('hex')
//       .slice(0, 7);

//     const role = await this.userService.getRoleByName(Role.FINANCIAL_OFFICER);

//     const userExists =
//       await this.userService.getUserByUsername(generated_username);

//     if (userExists) {
//       const randomNumber = Math.floor(Math.random() * 1000);
//       generated_username =
//         `${createUserDto.first_name}${randomNumber}.${sanitizedCollegeName}.finance`.toLowerCase();
//     }

//     const emailExists = await this.userService.getUserByEmail(
//       createUserDto.email
//     );
//     if (emailExists) {
//       this.logger.error('Email already exists');
//       throw new ConflictException('Email already exists');
//     }
//     const user = await this.userService.createUserWithCollegeId(
//       {
//         username: generated_username,
//         password: await bcrypt.hashSync(generated_password, 10),
//         email: createUserDto.email,
//         phone: createUserDto.phone,
//         first_name: createUserDto.first_name,
//         last_name: createUserDto.last_name,
//         role,
//       },
//       college_id
//     );

//     const financialAidOfficer = this.financialAidOfficerRepository.create({
//       ...createUserDto,
//       user,
//       school: admin.school,
//     });

//     await this.financialAidOfficerRepository.save(financialAidOfficer);

//     const loginUrl = `${process.env.FRONTEND_URL}`;
//     const first_name = createUserDto.first_name;

//     await this.mailService.sendTemplateMail(
//       {
//         to: createUserDto.email,
//         subject: 'Your Audease Account Has Been Created!',
//       },
//       'welcome-users',
//       {
//         first_name,
//         generated_username,
//         generated_password,
//         loginUrl,
//       }
//     );

//     this.logger.log('Financial Aid Officer Account created');
//     return {
//       message: 'User created successfully',
//     };
//   }

//   async addStudent(userId: string, createLearnerDto: CreateLearnerDto) {
//     const admin = await this.accountRepository.findAdmin(userId);
//     if (!admin) {
//       this.logger.error('User not found');
//       throw new NotFoundException('User not found');
//     }

//     const adminUsername = admin.username;
//     const sanitizedCollegeName = adminUsername.split('.')[1];
//     const college_id = admin.school.id;
//     let generated_username =
//       `${createLearnerDto.first_name}.${sanitizedCollegeName}.student`.toLowerCase();
//     const generated_password = crypto
//       .randomBytes(12)
//       .toString('hex')
//       .slice(0, 7);

//     const role = await this.userService.getRoleByName(Role.STUDENT);

//     const userExists =
//       await this.userService.getUserByUsername(generated_username);

//     if (userExists) {
//       const randomNumber = Math.floor(Math.random() * 1000);
//       generated_username =
//         `${createLearnerDto.first_name}${randomNumber}.${sanitizedCollegeName}.learner`.toLowerCase();
//     }

//     const emailExists = await this.userService.getUserByEmail(
//       createLearnerDto.email
//     );
//     if (emailExists) {
//       this.logger.error('Email already exists');
//       throw new ConflictException('Email already exists');
//     }
//     const user = await this.userService.createUserWithCollegeId(
//       {
//         username: generated_username,
//         password: await bcrypt.hashSync(generated_password, 10),
//         email: createLearnerDto.email,
//         phone: createLearnerDto.mobile_number,
//         first_name: createLearnerDto.first_name,
//         last_name: createLearnerDto.last_name,
//         role,
//       },
//       college_id
//     );

//     const student = this.studentRepository.create({
//       ...createLearnerDto,
//       user,
//       school: admin.school,
//     });

//     await this.studentRepository.save(student);

//     const loginUrl = `${process.env.FRONTEND_URL}`;
//     const first_name = createLearnerDto.first_name;

//     await this.mailService.sendTemplateMail(
//       {
//         to: createLearnerDto.email,
//         subject: 'Your Audease Account Has Been Created!',
//       },
//       'welcome-users',
//       {
//         first_name,
//         generated_username,
//         generated_password,
//         loginUrl,
//       }
//     );

//     this.logger.log('Student account created');
//     return {
//       message: 'User created successfully',
//     };
//   }

//   async addAuditor(userId: string, createUserDto: CreateAccountDto) {
//     const admin = await this.accountRepository.findAdmin(userId);
//     if (!admin) {
//       this.logger.error('User not found');
//       throw new NotFoundException('User not found');
//     }

//     const adminUsername = admin.username;
//     const sanitizedCollegeName = adminUsername.split('.')[1];
//     const college_id = admin.school.id;

//     let generated_username =
//       `${createUserDto.first_name}.${sanitizedCollegeName}.auditor`.toLowerCase();
//     const generated_password = crypto
//       .randomBytes(12)
//       .toString('hex')
//       .slice(0, 7);

//     const role = await this.userService.getRoleByName(Role.EXTERNAL_AUDITOR);

//     const userExists =
//       await this.userService.getUserByUsername(generated_username);

//     if (userExists) {
//       const randomNumber = Math.floor(Math.random() * 1000);
//       generated_username =
//         `${createUserDto.first_name}${randomNumber}.${sanitizedCollegeName}.auditor`.toLowerCase();
//     }

//     const emailExists = await this.userService.getUserByEmail(
//       createUserDto.email
//     );
//     if (emailExists) {
//       this.logger.error('Email already exists');
//       throw new ConflictException('Email already exists');
//     }

//     const expiration_date = new Date();
//     expiration_date.setHours(expiration_date.getHours() + 48);
//     const user = await this.userService.createUserWithCollegeId(
//       {
//         username: generated_username,
//         password: await bcrypt.hashSync(generated_password, 10),
//         email: createUserDto.email,
//         phone: createUserDto.phone,
//         first_name: createUserDto.first_name,
//         last_name: createUserDto.last_name,
//         role,
//         expiration_date,
//       },
//       college_id
//     );

//     await this.redis.set(
//       `auditor_password:${user.id}`,
//       user.password,
//       'EX',
//       2 * 24 * 60 * 60
//     );

//     setTimeout(
//       async () => {
//         await this.userRepository.update(user.id, { password: null });
//       },
//       2 * 24 * 60 * 60 * 1000
//     );

//     const loginUrl = `${process.env.FRONTEND_URL}`;
//     const first_name = createUserDto.first_name;

//     await this.mailService.sendTemplateMail(
//       {
//         to: createUserDto.email,
//         subject: 'Your Audease Account Has Been Created!',
//       },
//       'welcome-users',
//       {
//         first_name,
//         generated_username,
//         generated_password,
//         loginUrl,
//       }
//     );

//     this.logger.log('Auditor account created');
//     return {
//       message: 'User created successfully',
//     };
//   }
//   async addAccessor(userId: string, createUserDto: CreateAccountDto) {
//     const admin = await this.accountRepository.findAdmin(userId);
//     if (!admin) {
//       this.logger.error('User not found');
//       throw new NotFoundException('User not found');
//     }

//     const college_id = admin.school.id;
//     const adminUsername = admin.username;
//     const sanitizedCollegeName = adminUsername.split('.')[1];
//     let generated_username =
//       `${createUserDto.first_name}.${sanitizedCollegeName}.accessor`.toLowerCase();
//     const generated_password = crypto
//       .randomBytes(12)
//       .toString('hex')
//       .slice(0, 7);

//     const role = await this.userService.getRoleByName(Role.ACCESSOR);

//     const userExists =
//       await this.userService.getUserByUsername(generated_username);

//     if (userExists) {
//       const randomNumber = Math.floor(Math.random() * 1000);
//       generated_username =
//         `${createUserDto.first_name}${randomNumber}.${sanitizedCollegeName}.accessor`.toLowerCase();
//     }

//     const emailExists = await this.userService.getUserByEmail(
//       createUserDto.email
//     );
//     if (emailExists) {
//       this.logger.error('Email already exists');
//       throw new ConflictException('Email already exists');
//     }

//     const user = await this.userService.createUserWithCollegeId(
//       {
//         username: generated_username,
//         password: await bcrypt.hashSync(generated_password, 10),
//         email: createUserDto.email,
//         phone: createUserDto.phone,
//         first_name: createUserDto.first_name,
//         last_name: createUserDto.last_name,
//         role,
//       },
//       college_id
//     );

//     const accessor = this.accessorRepository.create({
//       ...createUserDto,
//       user,
//       school: admin.school,
//     });

//     await this.accessorRepository.save(accessor);

//     const loginUrl = `${process.env.FRONTEND_URL}`;
//     const first_name = createUserDto.first_name;

//     await this.mailService.sendTemplateMail(
//       {
//         to: createUserDto.email,
//         subject: 'Your Audease Account Has Been Created!',
//       },
//       'welcome-users',
//       {
//         first_name,
//         generated_username,
//         generated_password,
//         loginUrl,
//       }
//     );

//     this.logger.log('Accessor account created');
//     return {
//       message: 'User created successfully',
//     };
//   }
// }
