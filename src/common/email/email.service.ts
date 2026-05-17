import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, username: string) {
    const verifyUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.sendMail({
      to: email,
      subject: '✅ Verify your Social App account',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2>Welcome, ${username}! 🎉</h2>
          <p>Please verify your email address to get started.</p>
          <a href="${verifyUrl}" style="background:#1877f2;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">
            Verify Email
          </a>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, username: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.sendMail({
      to: email,
      subject: '🔑 Reset your Social App password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2>Hi ${username},</h2>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="background:#e74c3c;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  }

  private async sendMail(options: nodemailer.SendMailOptions) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        ...options,
      });
    } catch (error) {
      this.logger.error('Email send failed:', error);
    }
  }
}
