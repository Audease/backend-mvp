import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { FormService } from './form.service';
import { CreateSubmissionDto } from './dto/create-submission.entity';
import { UpdateSubmissionDto } from './dto/update-submission.entity';
import { ReviewSubmissionDto } from './dto/review-submission.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
// import { Permission } from '../utils/enum/permission';
// import { PermissionGuard } from '../auth/guards/permission.guard';
// import { Permissions } from '../shared/decorators/permission.decorator';
import { FormSubmission } from './entity/form-submission.entity';
import { CurrentUserId } from '../shared/decorators/get-current-user-id.decorator';

@ApiTags('Form Submissions')
@ApiBearerAuth()
@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormController {
  constructor(private readonly formSubmissionService: FormService) {}

  @Post('submissions')
  @ApiOperation({ summary: 'Create a new form submission draft' })
  @ApiBody({ type: CreateSubmissionDto })
  @ApiResponse({
    status: 201,
    description: 'The form submission has been successfully created.',
    type: FormSubmission,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  createSubmission(@Body() dto: CreateSubmissionDto) {
    return this.formSubmissionService.createSubmission(dto);
  }

  @Patch('submissions/:id')
  @ApiOperation({ summary: 'Update a draft submission' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiBody({ type: UpdateSubmissionDto })
  @ApiResponse({
    status: 200,
    description: 'The submission has been successfully updated.',
    type: FormSubmission,
  })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  updateSubmission(@Param('id') id: string, @Body() dto: UpdateSubmissionDto) {
    return this.formSubmissionService.updateDraft(dto, id);
  }

  @Post('submissions/submit/:id')
  @ApiOperation({ summary: 'Submit a form for review' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'The form has been successfully submitted.',
    type: FormSubmission,
  })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  submitForm(@Param('id') id: string) {
    return this.formSubmissionService.submitForm(id);
  }

  @Post('submissions/:id/review')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Review a submitted form' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiBody({ type: ReviewSubmissionDto })
  @ApiResponse({
    status: 200,
    description: 'The submission has been successfully reviewed.',
    type: FormSubmission,
  })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have required roles' })
  reviewSubmission(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @CurrentUserId() user: string
  ) {
    return this.formSubmissionService.reviewSubmission(id, dto, user);
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: 'Get a specific submission' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the requested submission.',
    type: FormSubmission,
  })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  getSubmission(@Param('id') id: string) {
    return this.formSubmissionService.getAllStudentForms(id);
  }

  @Get('submissions')
  @ApiOperation({ summary: 'Get all submissions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of submissions.',
    type: [FormSubmission],
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  getUserSubmissions(@CurrentUserId() user: string) {
    return this.formSubmissionService.getUserSubmissions(user);
  }
}
