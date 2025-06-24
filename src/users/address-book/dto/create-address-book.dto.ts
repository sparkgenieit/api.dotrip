import { IsInt, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { AddressType } from '../address-book.enum';

export class CreateAddressBookDto {
  @IsInt()
  userId: number;

  @IsEnum(AddressType)
  type: AddressType;

  // single “address” field—required
  @IsString()
  @IsNotEmpty()
  address: string;

  // make all the other fields optional
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() buildingName?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() flatNo?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() pinCode?: string;
}
