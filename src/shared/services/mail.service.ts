import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { Mail } from '../../utils/interface/mail.interface';

@Injectable()
export class MailService {
  private readonly mailsender = new MailerSend({
    apiKey: process.env.MAILER_SEND_API_KEY,
  });
  private readonly logger = new Logger('MailService');

  private static getTemplateContent(templateName: string): string {
    try {
      const dirName = process.cwd();
      const templatePath = path.resolve(
        dirName,
        `./src/template/${templateName}.html`,
      );
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new InternalServerErrorException('Failed to read template file');
    }
  }

  private static compileTemplate(
    template: string,
    data: Record<string, string | number>,
  ): string {
    return template.replace(/{{(\w+)}}/g, (match, key) => {
      const value = data[key];
      return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : match;
    });
  }

  public async sendTemplateMail(
    mail: Mail,
    templateName: string,
    data: Record<string, string | number>,
  ): Promise<void> {
    try {
      const templateContent = MailService.getTemplateContent(templateName);
      const compiledTemplate = MailService.compileTemplate(
        templateContent,
        data,
      );
      const sentFrom = new Sender(process.env.EMAIL_FROM, 'Audease');
      const recipient = [new Recipient(mail.to)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipient)
        .setReplyTo(sentFrom)
        .setSubject(mail.subject)
        .setHtml(compiledTemplate);

      await this.mailsender.email.send(emailParams);

      this.logger.log(`Mail sent to ${mail.to}`);
    } catch (error) {
      this.logger.error(`Failed to send mail: ${error}`);
      throw new InternalServerErrorException('Failed to send mail');
    }
  }
}