import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateVendorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  companyReg: string;

  @IsNotEmpty()
  @IsNumber()
  vendorId: number;
}
