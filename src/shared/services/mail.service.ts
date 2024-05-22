import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import path from 'path';
import { Logger } from '@nestjs/common';
import fs from 'fs';
import { Mail } from '../../utils/interface/mail.interface';

@Injectable()
export class MailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  private readonly logger = new Logger('MailService');

  private static getTemplateContent(templateName: string): string {
    const dirName = process.cwd();
    const templatePath = path.resolve(
      dirName,
      `./src/template/${templateName}.html`,
    );
    return fs.readFileSync(templatePath, 'utf8');
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

      await this.resend.emails.send({
        from: `Heirs of the Kingdom Chapel <${process.env.EMAIL_FROM}>`, // Replace with your actual email address
        to: mail.to,
        subject: mail.subject,
        html: compiledTemplate,
      });

      this.logger.log(`Mail sent to ${mail.to}`);
    } catch (error) {
      this.logger.error(`Failed to send mail: ${error}`);
      throw new InternalServerErrorException('Failed to send mail');
    }
  }
}
