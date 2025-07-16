# WhatsApp Mock Module

This is a simple mock WhatsApp messaging service for NestJS. It doesn't send real messages but prints a WhatsApp Web link to the console.

## Usage

```ts
import { WhatsAppService } from './whatsapp/whatsapp.service';

constructor(private whatsappService: WhatsAppService) {}

await this.whatsappService.sendMock(
  '+919000000000',
  '🚨 New booking! Quote now: https://yoururl.com/vendor-quotes?bookingId=123'
);
```

This will generate and print a link like:

```
https://wa.me/919000000000?text=New%20message
```

You can click that to open WhatsApp Web and send it manually.
