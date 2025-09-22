// src/shared/services/csv-processor.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse';

export interface CSVProcessingResult {
  validRecords: any[];
  errors: CSVError[];
  totalProcessed: number;
  validCount: number;
  errorCount: number;
}

export interface CSVError {
  row: number;
  column?: number;
  columnName?: string;
  field?: string;
  value?: any;
  error: string;
  type:
    | 'MISSING_REQUIRED'
    | 'INVALID_FORMAT'
    | 'DUPLICATE'
    | 'INVALID_VALUE'
    | 'MISSING_COLUMN';
}

export interface CSVFieldMapping {
  field: string;
  position: number; // 0-based column position
  required: boolean;
  type: 'string' | 'number' | 'date' | 'email';
  aliases?: string[]; // Still support name-based mapping as fallback
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
  description: string; // Human-readable description for error messages
}

export interface CSVMappingStrategy {
  usePositional: boolean;
  fieldMappings: CSVFieldMapping[];
}

@Injectable()
export class CSVProcessorService {
  // Define positional field mappings for learner CSV
  private readonly LEARNER_POSITIONAL_MAPPINGS: CSVFieldMapping[] = [
    {
      field: 'name',
      position: 0,
      required: true,
      type: 'string',
      description: 'Full name of the learner',
      aliases: [
        'name',
        'full_name',
        'student_name',
        'learner_name',
        'fullname',
      ],
    },
    {
      field: 'email',
      position: 1,
      required: true,
      type: 'email',
      description: 'Email address',
      aliases: ['email', 'email_address', 'e_mail', 'student_email'],
      validator: value => this.isValidEmail(value),
    },
    {
      field: 'date_of_birth',
      position: 2,
      required: false,
      type: 'date',
      description: 'Date of birth (YYYY-MM-DD format)',
      aliases: [
        'date_of_birth',
        'dob',
        'birth_date',
        'birthdate',
        'date_birth',
      ],
      transformer: value => this.formatDate(value),
    },
    {
      field: 'mobile_number',
      position: 3,
      required: false,
      type: 'string',
      description: 'Mobile phone number',
      aliases: [
        'mobile_number',
        'phone',
        'mobile',
        'phone_number',
        'contact_number',
      ],
    },
    {
      field: 'NI_number',
      position: 4,
      required: false,
      type: 'string',
      description: 'National Insurance number',
      aliases: [
        'ni_number',
        'national_insurance',
        'ni',
        'national_insurance_number',
      ],
    },
    {
      field: 'passport_number',
      position: 5,
      required: false,
      type: 'string',
      description: 'Passport number',
      aliases: ['passport_number', 'passport', 'passport_no'],
    },
    {
      field: 'home_address',
      position: 6,
      required: false,
      type: 'string',
      description: 'Home address',
      aliases: ['home_address', 'address', 'residential_address', 'home_addr'],
    },
    {
      field: 'funding',
      position: 7,
      required: false,
      type: 'string',
      description: 'Funding type or source',
      aliases: ['funding', 'funding_type', 'fund_type', 'sponsor'],
    },
    {
      field: 'level',
      position: 8,
      required: false,
      type: 'number',
      description: 'Course or study level',
      aliases: ['level', 'course_level', 'study_level', 'academic_level'],
      transformer: value => this.parseNumber(value),
    },
    {
      field: 'awarding',
      position: 9,
      required: false,
      type: 'string',
      description: 'Awarding body',
      aliases: [
        'awarding',
        'awarding_body',
        'award_body',
        'certification_body',
      ],
    },
    {
      field: 'chosen_course',
      position: 10,
      required: false,
      type: 'string',
      description: 'Chosen course or program',
      aliases: [
        'chosen_course',
        'course',
        'course_name',
        'program',
        'programme',
      ],
    },
  ];

  async parseCSVWithHeaders(
    fileBuffer: Buffer
  ): Promise<{ records: any[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
      const records = [];
      let headers = [];
      let isFirstRow = true;

      const parser = parse(fileBuffer.toString(), {
        columns: false, // Don't use first row as column names
        skip_empty_lines: true,
        trim: true,
        skip_records_with_error: false,
      });

      parser.on('readable', function () {
        let record;
        while ((record = parser.read())) {
          if (isFirstRow) {
            headers = record;
            isFirstRow = false;
          } else {
            // Convert array to object with positional keys
            const recordObj = {};
            record.forEach((value, index) => {
              recordObj[`col_${index}`] = value;
            });
            records.push(recordObj);
          }
        }
      });

      parser.on('error', function (err) {
        reject(new BadRequestException(`CSV parsing error: ${err.message}`));
      });

      parser.on('end', function () {
        resolve({ records, headers });
      });
    });
  }

  async parseCSV(fileBuffer: Buffer): Promise<any[]> {
    const { records } = await this.parseCSVWithHeaders(fileBuffer);
    return records;
  }

  /**
   * Detect the best mapping strategy for the CSV
   */
  detectMappingStrategy(headers: string[]): CSVMappingStrategy {
    // Try to match headers with known aliases
    const nameBasedMatches = this.LEARNER_POSITIONAL_MAPPINGS.map(mapping => {
      const matchedHeader = this.findMatchingHeader(
        headers,
        mapping.aliases || []
      );
      return {
        field: mapping.field,
        matched: !!matchedHeader,
        headerIndex: matchedHeader ? headers.indexOf(matchedHeader) : -1,
        mapping,
      };
    });

    // Count how many required fields we can match by name
    const requiredFieldsMatched = nameBasedMatches.filter(
      match => match.mapping.required && match.matched
    ).length;

    const totalRequiredFields = this.LEARNER_POSITIONAL_MAPPINGS.filter(
      mapping => mapping.required
    ).length;

    // If we can match all required fields by name, use name-based mapping
    if (requiredFieldsMatched === totalRequiredFields) {
      return {
        usePositional: false,
        fieldMappings: this.LEARNER_POSITIONAL_MAPPINGS,
      };
    }

    // Otherwise, use positional mapping
    return {
      usePositional: true,
      fieldMappings: this.LEARNER_POSITIONAL_MAPPINGS,
    };
  }

  processLearnerCSV(records: any[], headers: string[]): CSVProcessingResult {
    const validRecords = [];
    const errors: CSVError[] = [];
    let rowNumber = 1; // Start from 1 (excluding header)

    // Detect the best mapping strategy
    const strategy = this.detectMappingStrategy(headers);

    // Validate that we have enough columns for positional mapping
    if (strategy.usePositional) {
      const maxRequiredPosition = Math.max(
        ...strategy.fieldMappings
          .filter(mapping => mapping.required)
          .map(mapping => mapping.position)
      );

      if (headers.length <= maxRequiredPosition) {
        errors.push({
          row: 1,
          column: maxRequiredPosition + 1,
          columnName: `Column ${maxRequiredPosition + 1}`,
          error: `Insufficient columns. Expected at least ${maxRequiredPosition + 1} columns for positional mapping, but found ${headers.length}`,
          type: 'MISSING_COLUMN',
        });

        return {
          validRecords: [],
          errors,
          totalProcessed: records.length,
          validCount: 0,
          errorCount: errors.length,
        };
      }
    }

    for (const record of records) {
      rowNumber++;
      const processedRecord = {};
      const rowErrors: CSVError[] = [];

      // Process each field mapping
      for (const mapping of strategy.fieldMappings) {
        let value;
        let columnName = '';
        let columnIndex = -1;

        if (strategy.usePositional) {
          // Use positional mapping
          value = record[`col_${mapping.position}`];
          columnName =
            headers[mapping.position] || `Column ${mapping.position + 1}`;
          columnIndex = mapping.position;
        } else {
          // Use name-based mapping
          const matchedHeader = this.findMatchingHeader(
            headers,
            mapping.aliases || []
          );
          if (matchedHeader) {
            const headerIndex = headers.indexOf(matchedHeader);
            value = record[`col_${headerIndex}`];
            columnName = matchedHeader;
            columnIndex = headerIndex;
          }
        }

        // Check required fields
        if (mapping.required && this.isEmpty(value)) {
          rowErrors.push({
            row: rowNumber,
            column: columnIndex + 1,
            columnName,
            field: mapping.field,
            value: value,
            error: `Required field '${mapping.description}' is missing or empty in column '${columnName}'`,
            type: 'MISSING_REQUIRED',
          });
          continue;
        }

        // Skip processing if value is empty and field is optional
        if (this.isEmpty(value) && !mapping.required) {
          processedRecord[mapping.field] = null;
          continue;
        }

        // Validate value
        if (mapping.validator && !mapping.validator(value)) {
          rowErrors.push({
            row: rowNumber,
            column: columnIndex + 1,
            columnName,
            field: mapping.field,
            value: value,
            error: `Invalid ${mapping.type} format for '${mapping.description}' in column '${columnName}': ${value}`,
            type: 'INVALID_FORMAT',
          });
          continue;
        }

        // Transform value
        let processedValue = value;
        if (mapping.transformer) {
          try {
            processedValue = mapping.transformer(value);
          } catch (error) {
            rowErrors.push({
              row: rowNumber,
              column: columnIndex + 1,
              columnName,
              field: mapping.field,
              value: value,
              error: `Error transforming '${mapping.description}' in column '${columnName}': ${error.message}`,
              type: 'INVALID_VALUE',
            });
            continue;
          }
        }

        processedRecord[mapping.field] = processedValue;
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validRecords.push(processedRecord);
      }
    }

    return {
      validRecords,
      errors,
      totalProcessed: records.length,
      validCount: validRecords.length,
      errorCount: errors.length,
    };
  }

  private findMatchingHeader(
    headers: string[],
    aliases: string[]
  ): string | null {
    for (const alias of aliases) {
      // Try exact match first
      const exactMatch = headers.find(header => header === alias);
      if (exactMatch) return exactMatch;

      // Try case-insensitive match
      const caseInsensitiveMatch = headers.find(
        header =>
          header.toLowerCase().replace(/[^a-z0-9]/g, '') ===
          alias.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (caseInsensitiveMatch) return caseInsensitiveMatch;
    }
    return null;
  }

  private isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return null;

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') return null;

    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return num;
  }

  generateErrorReport(
    errors: CSVError[],
    strategy?: CSVMappingStrategy
  ): string {
    let report = 'CSV Import Errors:\n\n';

    if (strategy) {
      report += `Mapping Strategy: ${strategy.usePositional ? 'Positional' : 'Name-based'}\n\n`;
    }

    const groupedErrors = errors.reduce((acc, error) => {
      const key = `Row ${error.row}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(error);
      return acc;
    }, {});

    for (const [row, rowErrors] of Object.entries(groupedErrors)) {
      report += `${row}:\n`;
      (rowErrors as CSVError[]).forEach(error => {
        if (error.column) {
          report += `  - Column ${error.column} (${error.columnName}): ${error.error}\n`;
        } else {
          report += `  - ${error.error}\n`;
        }
      });
      report += '\n';
    }

    return report;
  }

  /**
   * Generate a template CSV with the expected column order
   */
  generateTemplate(): string {
    const headers = this.LEARNER_POSITIONAL_MAPPINGS.sort(
      (a, b) => a.position - b.position
    ).map(mapping => mapping.description);

    const sampleData = [
      'John Doe',
      'john.doe@example.com',
      '1990-01-15',
      '+44123456789',
      'AB123456C',
      'P1234567',
      '123 Main St, London',
      'Self-funded',
      '1',
      'NCFE',
      'Adult Care',
    ];

    return [headers.join(','), sampleData.join(',')].join('\n');
  }
}
