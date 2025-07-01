import { PartialType } from '@nestjs/mapped-types';
import { CreateCorporateBookingDto } from './create-corporate-booking.dto';

export class UpdateCorporateBookingDto extends PartialType(CreateCorporateBookingDto) {}
