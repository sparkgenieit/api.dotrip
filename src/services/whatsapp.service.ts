import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  sendMessage(to: string, message: string) {
    const encoded = encodeURIComponent(message);
    const url = `https://web.whatsapp.com/send?phone=${to}&text=${encoded}`;
    console.log('Mock WhatsApp link:', url);
    return url;
  }
}
