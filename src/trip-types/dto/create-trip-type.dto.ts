import { IsString } from 'class-validator';

export class CreateTripTypeDto {
  @IsString()
  label: string;
}
