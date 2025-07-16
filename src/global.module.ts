import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { EmailService } from './services/email.service';
import { WhatsappService } from './services/whatsapp.service';
import { LoggerService } from './services/logger.service';

const emailTransport = process.env.PROD === 'true'
  ? {
      secure: true,
      ignoreTLS: true,
      debug: false,
    }
  : {
      host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525', 10),
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

@Global()
@Module({
  imports: [
    ConfigModule, // ✅ required if you're injecting ConfigService globally
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: emailTransport,
        defaults: {
          from: `"${config.get('APP_NAME') || 'doTrip'} Support" <${config.get('MAIL_FROM') || 'noreply@dotrip.in'}>`,
        },
        template: {
          dir: path.join(process.cwd(), 'src/emails'), // ✅ use absolute src path          adapter: new HandlebarsAdapter({}, { inlineCssEnabled: true }),
          adapter: new HandlebarsAdapter(
            {},
            {
              inlineCssEnabled: true,
              // inlineCssOptions: {
              //   url: ' ',
              //   preserveMediaQueries: true, 
              // },
            },
          ),
          options: {
            strict: true,
          },
        },
        preview: true,
        
        
       
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService, WhatsappService, LoggerService],
  exports: [EmailService, WhatsappService, LoggerService],
})
export class GlobalModule {}
