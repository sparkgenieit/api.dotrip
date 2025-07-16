import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsAppService {
  async sendMock(to: string, message: string): Promise<string> {
    const phone = to.replace(/[^\d]/g, ''); // Remove non-numeric characters
    const encodedMessage = encodeURIComponent(message);
    const link = `https://wa.me/${phone}?text=${encodedMessage}`;

    console.log('📲 Open this link to send WhatsApp message manually:');
    console.log(link);

    return link;
  }
}
