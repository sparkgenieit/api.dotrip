import { IsInt, IsEnum, IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { AddressType } from '../address-book.enum';

export class CreateAddressBookDto {
  @IsInt() userId: number;
  @IsEnum(AddressType) type: AddressType;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() addressLine1: string;
  @IsString() @IsNotEmpty() buildingName: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() flatNo?: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsString() @Length(10,15) phone: string;
  @IsString() @Length(4,10) pinCode: string;
}
