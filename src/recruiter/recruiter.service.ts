import {
  BadRequestException,
  //   BadRequestException,
  ConflictException,
  //   ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProspectiveStudent } from './entities/prospective-student.entity';
import { Repository } from 'typeorm';
import { CreateLearnerDto } from './dto/create-learner.dto';
import { Users } from '../users/entities/user.entity';
import { PaginationParamsDto } from './dto/pagination-params.dto';
import { UpdateLearnerDto } from './dto/update-learner.dto';
import { FilterStudentsDto } from './dto/filter-params.dto';
import { RecruiterRepository } from './recruiter.repository';
import {
  CSVProcessorService,
  CSVProcessingResult,
  CSVError,
} from '../shared/services/csv-processor.service';

@Injectable()
export class RecruiterService {
  private readonly logger = new Logger(RecruiterService.name);

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(ProspectiveStudent)
    private readonly learnerRepository: Repository<ProspectiveStudent>,
    private readonly recruiterRepository: RecruiterRepository,
    private readonly csvProcessor: CSVProcessorService
  ) {}

  async createLearner(userId: string, createLearnerDto: CreateLearnerDto) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const learnerExist =
      await this.recruiterRepository.findLearner(createLearnerDto);

    if (learnerExist) {
      if (
        learnerExist.email === createLearnerDto.email ||
        learnerExist.mobile_number === createLearnerDto.mobile_number
      ) {
        this.logger.error('Email or mobile number already exist');
        throw new ConflictException('Email or mobile number already exist');
      }
    }

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDate(createLearnerDto.date_of_birth);

    const learner = this.learnerRepository.create({
      name: createLearnerDto.name,
      date_of_birth: formattedDate,
      mobile_number: createLearnerDto.mobile_number,
      email: createLearnerDto.email,
      NI_number: createLearnerDto.NI_number,
      passport_number: createLearnerDto.passport_number,
      home_address: createLearnerDto.home_address,
      funding: createLearnerDto.funding,
      level: createLearnerDto.level,
      awarding: createLearnerDto.awarding,
      chosen_course: createLearnerDto.chosen_course,
      user: loggedInUser,
      school: loggedInUser.school,
      onboarding_status: 'completed',
    });

    await this.learnerRepository.save(learner);
    this.logger.log('Learner created successfully');
    return { message: 'You just created a learner' };
  }

  async importLearners(userId: string, file: Express.Multer.File) {
    // Step 1: Validate file presence
    if (!file) {
      this.logger.error('No file uploaded');
      throw new BadRequestException({
        error: 'FILE_MISSING',
        message: 'No file uploaded',
        details: 'Please select a CSV file to upload',
        template: this.csvProcessor.generateTemplate(),
      });
    }

    // Step 2: Validate file type
    const allowedMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
    const hasValidExtension = file.originalname.toLowerCase().endsWith('.csv');
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);

    if (!hasValidExtension && !hasValidMimeType) {
      this.logger.error(
        `Invalid file type: ${file.mimetype}, filename: ${file.originalname}`
      );
      throw new BadRequestException({
        error: 'INVALID_FILE_TYPE',
        message: 'Invalid file type',
        details:
          'Only CSV files are allowed. Please upload a file with .csv extension',
        allowedTypes: ['text/csv', 'application/csv'],
        receivedType: file.mimetype,
        template: this.csvProcessor.generateTemplate(),
      });
    }

    // Step 3: Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.logger.error(`File too large: ${file.size} bytes`);
      throw new BadRequestException({
        error: 'FILE_TOO_LARGE',
        message: 'File size exceeds limit',
        details: `File size must be less than ${maxSize / 1024 / 1024}MB. Current file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        maxSize: maxSize,
        currentSize: file.size,
        template: this.csvProcessor.generateTemplate(),
      });
    }

    // Step 4: Validate user authentication
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error(`User not found: ${userId}`);
      throw new NotFoundException({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        details: 'The authenticated user could not be found in the system',
      });
    }

    if (!loggedInUser.school) {
      this.logger.error(`User has no associated school: ${userId}`);
      throw new BadRequestException({
        error: 'NO_SCHOOL_ASSOCIATION',
        message: 'User has no school association',
        details: 'The user must be associated with a school to import learners',
      });
    }

    // Step 5: Parse CSV file
    let records: any[];
    let headers: string[];
    const parseStartTime = Date.now();

    try {
      this.logger.log(`Starting CSV parsing for file: ${file.originalname}`);
      const parseResult = await this.csvProcessor.parseCSVWithHeaders(
        file.buffer
      );
      records = parseResult.records;
      headers = parseResult.headers;

      const parseTime = Date.now() - parseStartTime;
      this.logger.log(
        `CSV parsing completed in ${parseTime}ms. Found ${records.length} data rows with ${headers.length} columns`
      );
    } catch (error) {
      this.logger.error(`CSV parsing failed: ${error.message}`);
      throw new BadRequestException({
        error: 'CSV_PARSE_ERROR',
        message: 'Failed to parse CSV file',
        details: `The CSV file could not be parsed. ${error.message}`,
        troubleshooting: [
          'Ensure the file is a valid CSV format',
          'Check for special characters or encoding issues',
          'Verify that the file is not corrupted',
          'Make sure the file has proper CSV structure with commas as separators',
        ],
        template: this.csvProcessor.generateTemplate(),
      });
    }

    // Step 6: Validate CSV content
    if (headers.length === 0) {
      throw new BadRequestException({
        error: 'NO_HEADERS',
        message: 'CSV file has no headers',
        details: 'The CSV file must contain at least a header row',
        template: this.csvProcessor.generateTemplate(),
      });
    }

    if (records.length === 0) {
      throw new BadRequestException({
        error: 'EMPTY_CSV',
        message: 'CSV file contains no data',
        details:
          'The uploaded CSV file is empty or contains only headers. Please add learner data rows.',
        expectedFormat:
          'The CSV should have a header row followed by data rows',
        template: this.csvProcessor.generateTemplate(),
      });
    }

    // Step 7: Log CSV structure for debugging
    this.logger.log(`CSV Structure - Headers: [${headers.join(', ')}]`);
    this.logger.log(`First record sample: ${JSON.stringify(records[0])}`);

    // Step 8: Process CSV records with validation
    let processingResult: CSVProcessingResult;
    let strategy;

    try {
      this.logger.log('Starting CSV record processing and validation');
      processingResult = this.csvProcessor.processLearnerCSV(records, headers);
      strategy = this.csvProcessor.detectMappingStrategy(headers);

      this.logger.log(
        `Processing completed. Valid: ${processingResult.validCount}, Errors: ${processingResult.errorCount}, Strategy: ${strategy.usePositional ? 'positional' : 'name-based'}`
      );
    } catch (error) {
      this.logger.error(`CSV processing failed: ${error.message}`);
      throw new BadRequestException({
        error: 'CSV_PROCESSING_ERROR',
        message: 'Failed to process CSV records',
        details: error.message,
        template: this.csvProcessor.generateTemplate(),
      });
    }

    // Step 9: Handle case where no valid records found
    if (processingResult.validCount === 0) {
      const errorSummary = this.generateErrorSummary(processingResult.errors);

      throw new BadRequestException({
        error: 'NO_VALID_RECORDS',
        message: 'No valid records found in CSV',
        details:
          'All records in the CSV file have validation errors. Please fix the errors and try again.',
        errorReport: this.csvProcessor.generateErrorReport(
          processingResult.errors,
          strategy
        ),
        errorSummary,
        errors: processingResult.errors,
        mappingStrategy: strategy.usePositional ? 'positional' : 'name-based',
        troubleshooting: [
          'Check that required fields (name, email) are present',
          'Verify email addresses are in correct format',
          'Ensure date formats are valid (YYYY-MM-DD)',
          'Check for special characters that might cause issues',
        ],
        template: this.csvProcessor.generateTemplate(),
      });
    }

    // Step 10: Check for duplicates in database
    this.logger.log(
      `Checking ${processingResult.validCount} valid records for duplicates`
    );
    const duplicateCheckResults = await this.checkForDuplicates(
      processingResult.validRecords
    );

    if (duplicateCheckResults.duplicates.length > 0) {
      this.logger.log(
        `Found ${duplicateCheckResults.duplicates.length} duplicate records`
      );

      // Add duplicate errors to the processing result
      processingResult.errors.push(...duplicateCheckResults.errors);
      processingResult.validRecords = duplicateCheckResults.validRecords;
      processingResult.validCount = duplicateCheckResults.validRecords.length;
      processingResult.errorCount += duplicateCheckResults.errors.length;
    }

    // Step 11: Handle case where all records are duplicates
    if (processingResult.validCount === 0) {
      const errorSummary = this.generateErrorSummary(processingResult.errors);

      throw new BadRequestException({
        error: 'ALL_DUPLICATES',
        message: 'All records are duplicates',
        details:
          'All learners in the CSV file already exist in the system. No new records to import.',
        errorReport: this.csvProcessor.generateErrorReport(
          processingResult.errors,
          strategy
        ),
        errorSummary,
        errors: processingResult.errors,
        suggestion:
          'Please remove duplicate entries or upload a file with new learners',
      });
    }

    // Step 12: Create learner entities
    this.logger.log(`Creating ${processingResult.validCount} learner entities`);
    const learners = processingResult.validRecords.map(record => {
      try {
        return this.learnerRepository.create({
          ...record,
          user: loggedInUser,
          school: loggedInUser.school,
          onboarding_status: 'completed',
          application_status: 'Pending',
          application_mail: 'Not sent',
          is_archived: false,
        });
      } catch (error) {
        this.logger.error(
          `Error creating learner entity: ${error.message}`,
          record
        );
        throw new Error(`Failed to create learner entity: ${error.message}`);
      }
    });

    // Step 13: Save learners to database with transaction
    let savedLearners: ProspectiveStudent[];
    try {
      this.logger.log(`Saving ${learners.length} learners to database`);
      const saveStartTime = Date.now();

      // Use transaction for atomic operation
      savedLearners = await this.learnerRepository.manager.transaction(
        async transactionalEntityManager => {
          const savedEntities: ProspectiveStudent[] = [];

          for (const learner of learners) {
            try {
              const saved = await transactionalEntityManager.save(
                ProspectiveStudent,
                learner
              );
              if (Array.isArray(saved)) {
                savedEntities.push(...saved);
              } else {
                savedEntities.push(saved);
              }
            } catch (error) {
              this.logger.error(
                `Failed to save individual learner: ${error.message}`,
                {
                  name: learner.forEach(name => name),
                  email: learner.forEach(email => email),
                }
              );
              throw error;
            }
          }

          return savedEntities;
        }
      );

      const saveTime = Date.now() - saveStartTime;
      this.logger.log(
        `Successfully saved ${savedLearners.length} learners to database in ${saveTime}ms`
      );
    } catch (error) {
      this.logger.error(
        `Database transaction failed: ${error.message}`,
        error.stack
      );

      // Provide specific error messages based on common database errors
      let errorDetails = error.message;
      if (error.code === '23505') {
        // Unique constraint violation
        errorDetails =
          'Duplicate entry detected during save operation. This might be a race condition.';
      } else if (error.code === '23502') {
        // Not null violation
        errorDetails = 'Required field is missing during save operation.';
      } else if (error.code === '23503') {
        // Foreign key violation
        errorDetails =
          'Invalid reference to related data during save operation.';
      }

      throw new BadRequestException({
        error: 'DATABASE_ERROR',
        message: 'Failed to save learners to database',
        details: errorDetails,
        sqlError: error.code,
        suggestion:
          'Please try again. If the problem persists, contact support.',
      });
    }

    // Step 14: Generate success response with detailed information
    const errorSummary =
      processingResult.errors.length > 0
        ? this.generateErrorSummary(processingResult.errors)
        : null;

    const response = {
      success: true,
      message: `Successfully imported ${savedLearners.length} learners`,
      mappingStrategy: strategy.usePositional ? 'positional' : 'name-based',
      processingTime: Date.now() - parseStartTime,
      summary: {
        totalProcessed: processingResult.totalProcessed,
        imported: savedLearners.length,
        errors: processingResult.errorCount,
        duplicatesFound: duplicateCheckResults.duplicates.length,
      },
      importedLearners: savedLearners.map((learner: ProspectiveStudent) => ({
        id: learner.id,
        name: learner.name,
        email: learner.email,
        created_at: learner.created_at,
      })),
    };

    // Step 15: Include error details if there were any errors
    if (processingResult.errors.length > 0) {
      response['errorDetails'] = {
        hasErrors: true,
        errorCount: processingResult.errors.length,
        errorSummary,
        errorReport: this.csvProcessor.generateErrorReport(
          processingResult.errors,
          strategy
        ),
        errors: processingResult.errors.map(error => ({
          row: error.row,
          column: error.column,
          columnName: error.columnName,
          field: error.field,
          value: error.value,
          error: error.error,
          type: error.type,
        })),
        recommendation:
          'Review the errors above and fix them in your CSV file for a complete import.',
      };
    }

    // Step 16: Log final results
    this.logger.log(
      `Import completed successfully. Imported: ${savedLearners.length}, Errors: ${processingResult.errorCount}, Total time: ${Date.now() - parseStartTime}ms`
    );

    return response;
  }

  /**
   * Check for duplicate learners in the database
   */
  private async checkForDuplicates(records: any[]) {
    const validRecords = [];
    const duplicates = [];
    const errors: CSVError[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        // Check for existing learner with same email or mobile number
        const existingLearner = await this.recruiterRepository.findLearner({
          email: record.email,
          mobile_number: record.mobile_number,
        });

        if (existingLearner) {
          duplicates.push(record);

          const duplicateFields = [];
          if (existingLearner.email === record.email) {
            duplicateFields.push('email');
          }
          if (existingLearner.mobile_number === record.mobile_number) {
            duplicateFields.push('mobile number');
          }

          errors.push({
            row: i + 2, // +2 because array is 0-indexed and we skip header
            field: duplicateFields.join(', '),
            value: duplicateFields
              .map(field =>
                field === 'email' ? record.email : record.mobile_number
              )
              .join(', '),
            error: `Learner with this ${duplicateFields.join(' and ')} already exists in the system`,
            type: 'DUPLICATE' as const,
          });
        } else {
          validRecords.push(record);
        }
      } catch (error) {
        this.logger.error(
          `Error checking for duplicates: ${error.message}`,
          record
        );
        errors.push({
          row: i + 2,
          error: `Database error while checking for duplicates: ${error.message}`,
          type: 'INVALID_VALUE' as const,
        });
      }
    }

    return { validRecords, duplicates, errors };
  }

  /**
   * Generate error summary for better user understanding
   */
  private generateErrorSummary(errors: CSVError[]) {
    // Define the error counts type properly
    interface ErrorCounts {
      MISSING_REQUIRED?: number;
      INVALID_FORMAT?: number;
      DUPLICATE?: number;
      INVALID_VALUE?: number;
      MISSING_COLUMN?: number;
    }

    const errorCounts: ErrorCounts = errors.reduce(
      (acc: ErrorCounts, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      },
      {}
    );

    const summary = {
      totalErrors: errors.length,
      byType: errorCounts,
      affectedRows: [...new Set(errors.map(e => e.row))].length,
    };

    const messages: string[] = [];
    if (errorCounts.MISSING_REQUIRED) {
      messages.push(`${errorCounts.MISSING_REQUIRED} missing required fields`);
    }
    if (errorCounts.INVALID_FORMAT) {
      messages.push(`${errorCounts.INVALID_FORMAT} invalid format errors`);
    }
    if (errorCounts.DUPLICATE) {
      messages.push(`${errorCounts.DUPLICATE} duplicate entries`);
    }
    if (errorCounts.INVALID_VALUE) {
      messages.push(`${errorCounts.INVALID_VALUE} invalid values`);
    }
    if (errorCounts.MISSING_COLUMN) {
      messages.push(`${errorCounts.MISSING_COLUMN} missing columns`);
    }

    return {
      ...summary,
      description: messages.join(', '),
    };
  }

  async getAllStudents(userId: string, paginationParams: PaginationParamsDto) {
    const { page = 1, limit = 10 } = paginationParams;

    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive numbers.');
    }

    const loggedInUser = await this.recruiterRepository.findUser(userId);
    const schoolId = loggedInUser.school.id;
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .select([
        'prospective_student.id',
        'prospective_student.name',
        'prospective_student.mobile_number',
        'prospective_student.email',
        'prospective_student.level',
        'prospective_student.date_of_birth',
        'prospective_student.home_address',
        'prospective_student.funding',
        'prospective_student.chosen_course',
        'prospective_student.passport_number',
        'prospective_student.NI_number',
        'prospective_student.awarding',
        'prospective_student.created_at',
      ])
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      })
      .where('prospective_student.school_id = :schoolId', { schoolId });

    const [result, total] = await Promise.all([
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStudent(userId: string, studentId: string) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const student = await this.recruiterRepository.findStudent(studentId);
    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    return student;
  }

  async editInformation(
    userId: string,
    studentId: string,
    updateLearnerDto: UpdateLearnerDto
  ) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const student = await this.recruiterRepository.findStudent(studentId);

    if (!student) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    const updatedInfo = await this.learnerRepository.preload({
      id: studentId,
      ...updateLearnerDto,
    });

    if (!updatedInfo) {
      throw new NotFoundException(`Learner with id: ${studentId} not found`);
    }

    return await this.learnerRepository.save(updatedInfo);
  }

  async deleteStudent(userId: string, studentId: string) {
    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    const student = await this.learnerRepository.findOneBy({
      id: studentId,
      user: { id: loggedInUser.id },
    });

    if (!student) {
      this.logger.error('Learner not found');
      throw new NotFoundException(`Learner not found`);
    }

    const result = await this.learnerRepository.delete(studentId);

    if (result.affected === 0) {
      this.logger.error('Site could not be deleted');
      throw new NotFoundException('Site could not be deleted');
    }
  }

  async getFilteredStudents(userId: string, filterDto: FilterStudentsDto) {
    const {
      funding,
      chosen_course,
      page = 1,
      limit = 10,
      search,
      sort = 'asc',
    } = filterDto;

    // Ensure page and limit are numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const loggedInUser = await this.recruiterRepository.findUser(userId);
    if (!loggedInUser) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    // Create query builder for the main data
    const queryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .leftJoinAndSelect('prospective_student.user', 'creator_user')
      .leftJoin(
        'users',
        'student_user',
        'student_user.email = prospective_student.email AND student_user.role_id != creator_user.role_id'
      )
      .where('prospective_student.school_id = :schoolId', {
        schoolId: loggedInUser.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      });

    // Apply filters
    if (funding) {
      queryBuilder.andWhere('prospective_student.funding ILIKE :funding', {
        funding: `%${funding}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(prospective_student.name ILIKE :search OR ' +
          'prospective_student.email ILIKE :search OR ' +
          'prospective_student.mobile_number ILIKE :search OR ' +
          'prospective_student.NI_number ILIKE :search OR ' +
          'prospective_student.passport_number ILIKE :search OR ' +
          'prospective_student.home_address ILIKE :search OR ' +
          'prospective_student.funding ILIKE :search OR ' +
          'CAST(prospective_student.level AS TEXT) ILIKE :search OR ' +
          'prospective_student.awarding ILIKE :search OR ' +
          'prospective_student.chosen_course ILIKE :search OR ' +
          'student_user.username ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    if (chosen_course) {
      queryBuilder.andWhere(
        'prospective_student.chosen_course ILIKE :chosen_course',
        {
          chosen_course: `%${chosen_course}%`,
        }
      );
    }

    // Apply sorting
    const sortDirection = sort.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy('prospective_student.created_at', sortDirection);

    // Create count query builder
    const countQueryBuilder = this.learnerRepository
      .createQueryBuilder('prospective_student')
      .where('prospective_student.school_id = :schoolId', {
        schoolId: loggedInUser.school.id,
      })
      .andWhere('prospective_student.is_archived = :isArchived', {
        isArchived: false,
      });

    // Apply the same filters to count query
    if (funding) {
      countQueryBuilder.andWhere('prospective_student.funding ILIKE :funding', {
        funding: `%${funding}%`,
      });
    }

    if (search) {
      countQueryBuilder.andWhere(
        '(prospective_student.name ILIKE :search OR ' +
          'prospective_student.email ILIKE :search OR ' +
          'prospective_student.mobile_number ILIKE :search OR ' +
          'prospective_student.NI_number ILIKE :search OR ' +
          'prospective_student.passport_number ILIKE :search OR ' +
          'prospective_student.home_address ILIKE :search OR ' +
          'prospective_student.funding ILIKE :search OR ' +
          'CAST(prospective_student.level AS TEXT) ILIKE :search OR ' +
          'prospective_student.awarding ILIKE :search OR ' +
          'prospective_student.chosen_course ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    if (chosen_course) {
      countQueryBuilder.andWhere(
        'prospective_student.chosen_course ILIKE :chosen_course',
        {
          chosen_course: `%${chosen_course}%`,
        }
      );
    }

    // Get total count and paginated data separately
    const total = await countQueryBuilder.getCount();

    // Add specific fields, pagination and execute
    const results = await queryBuilder
      .select([
        'prospective_student.id',
        'prospective_student.name',
        'prospective_student.email',
        'prospective_student.date_of_birth',
        'prospective_student.mobile_number',
        'prospective_student.NI_number',
        'prospective_student.passport_number',
        'prospective_student.home_address',
        'prospective_student.funding',
        'prospective_student.level',
        'prospective_student.awarding',
        'prospective_student.chosen_course',
        'prospective_student.created_at',
        'prospective_student.application_mail',
        'creator_user.id',
        'creator_user.first_name',
        'creator_user.last_name',
        'student_user.username',
        'student_user.last_login_at',
        'student_user.id',
      ])
      .offset((pageNum - 1) * limitNum)
      .limit(limitNum)
      .getRawMany();

    // Transform data
    const transformedData = results.map(row => ({
      id: row.prospective_student_id,
      name: row.prospective_student_name,
      email: row.prospective_student_email,
      date_of_birth: row.prospective_student_date_of_birth,
      mobile_number: row.prospective_student_mobile_number,
      NI_number: row.prospective_student_NI_number,
      passport_number: row.prospective_student_passport_number,
      home_address: row.prospective_student_home_address,
      funding: row.prospective_student_funding,
      level: row.prospective_student_level,
      awarding: row.prospective_student_awarding,
      chosen_course: row.prospective_student_chosen_course,
      created_at: row.prospective_student_created_at,
      application_mail: row.prospective_student_application_mail,
      created_by: {
        id: row.creator_user_id,
        name: `${row.creator_user_first_name || ''} ${row.creator_user_last_name || ''}`.trim(),
      },
      has_account: !!row.student_user_id,
      user: row.student_user_id
        ? {
            username: row.student_user_username,
            last_login_at: row.student_user_last_login_at,
          }
        : null,
    }));

    // Return with consistent pagination structure
    return {
      data: transformedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      lastPage: Math.ceil(total / limitNum), // for consistency
    };
  }
}
