import { PartialType } from '@nestjs/mapped-types';
import { CreateTripTypeDto } from './create-trip-type.dto';

export class UpdateTripTypeDto extends PartialType(CreateTripTypeDto) {}
