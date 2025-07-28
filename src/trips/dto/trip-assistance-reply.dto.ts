// src/trips/dto/trip-assistance-reply.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class TripAssistanceReplyDto {
  @IsString()
  @IsNotEmpty()
  reply: string;
}
