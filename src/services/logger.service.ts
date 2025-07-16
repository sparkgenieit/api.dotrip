import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  logInfo(message: string) {
    this.log(message);
  }

  logError(error: string) {
    this.error(error);
  }
}
