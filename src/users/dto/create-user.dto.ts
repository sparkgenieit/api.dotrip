// src/users/dto/create-user.dto.ts

import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../role.enum';

import { CreateAddressBookDto } from '../address-book/dto/create-address-book.dto';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  /** which Role this user has (defaults to RIDER if omitted) */
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  /** inline creation of home/office/other addresses */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressBookDto)
  addresses?: CreateAddressBookDto[];
}
