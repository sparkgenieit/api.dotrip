// === FILE: src/vendors/dto/vendor.dto.ts ======================================
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

// Tab 1 — Basic Info
export class CreateVendorDto {
  @IsString() name: string; // BasicInfoForm.vendorName

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() primaryMobile?: string;
  @IsOptional() @IsString() altMobile?: string;
  @IsOptional() @IsString() otherNumber?: string;

  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() pincode?: string;
  @IsOptional() @IsString() address?: string;

  // invoice
  @IsOptional() @IsString() invoiceCompanyName?: string;
  @IsOptional() @IsString() invoiceAddress?: string;
  @IsOptional() @IsString() invoicePincode?: string;
  @IsOptional() @IsString() invoiceGstin?: string;
  @IsOptional() @IsString() invoicePan?: string;
  @IsOptional() @IsString() invoiceContactNo?: string;
  @IsOptional() @IsEmail() invoiceEmail?: string;

  // margin (allow string or number from UI)
  @IsOptional() vendorMarginPercent?: string | number;
  @IsOptional() @IsString() vendorMarginGstType?: 'Included' | 'Excluded';
  @IsOptional() vendorMarginGstPct?: string | number;

  // logo handled separately in your uploader; here we just keep URL when saved
  @IsOptional() @IsString() logoUrl?: string;
}
export class UpdateVendorDto extends CreateVendorDto {}

// Tab 2 — Branches
export class BranchDto {
  @IsOptional() @IsInt() id?: number;
  @IsString() name: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() primaryMobile?: string;
  @IsOptional() @IsString() altMobile?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() pincode?: string;
  // UI sends labels like "5 % GST - %5"; accept both string/number
  @IsOptional() gstType?: 'Included' | 'Excluded' | string;
  @IsOptional() gstPercent?: string | number;
  @IsOptional() @IsString() address?: string;
}
export class UpsertBranchesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BranchDto)
  branches: BranchDto[];
}

// Tab 3/5 — Driver cost
export class DriverCostDto {
  @IsInt() vehicleTypeId: number;
  @IsNumber() @Min(0) driverBhatta: number;
  @IsNumber() @Min(0) foodCost: number;
  @IsNumber() @Min(0) accomodationCost: number;
  @IsNumber() @Min(0) extraCost: number;
  @IsNumber() @Min(0) morningPerHour: number;
  @IsNumber() @Min(0) eveningPerHour: number;
}
export class UpsertDriverCostsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => DriverCostDto)
  rows: DriverCostDto[];
}

// Tab 5 — Extra costs
export class ExtraCostDto {
  @IsInt() vehicleTypeId: number;
  @IsNumber() @Min(0) extraKm: number;
  @IsNumber() @Min(0) extraHour: number;
  @IsNumber() @Min(0) earlyMorning: number;
  @IsNumber() @Min(0) evening: number;
}
export class UpsertExtraCostsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ExtraCostDto)
  rows: ExtraCostDto[];
}

// Tab 3/5 — Local KM limits + charges
export class LocalLimitDto {
  @IsInt() vehicleTypeId: number;
  @IsString() title: string;
  @IsInt() hours: number;
  @IsInt() km: number;
}
export class UpsertLocalLimitsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => LocalLimitDto)
  rows: LocalLimitDto[];
}
export class LocalChargeDto {
  @IsInt() vehicleTypeId: number;
  @IsOptional() @IsString() startDate?: string; // ISO
  @IsOptional() @IsString() endDate?: string;   // ISO
  @IsNumber() amount: number;
}
export class UpsertLocalChargesDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => LocalChargeDto)
  rows: LocalChargeDto[];
}

// Tab 3/5 — Outstation KM limits + charges
export class OutstationLimitDto {
  @IsInt() vehicleTypeId: number;
  @IsString() title: string;
  @IsInt() km: number;
}
export class UpsertOutstationLimitsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => OutstationLimitDto)
  rows: OutstationLimitDto[];
}
export class OutstationChargeDto {
  @IsInt() vehicleTypeId: number;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsNumber() amount: number;
}
export class UpsertOutstationChargesDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => OutstationChargeDto)
  rows: OutstationChargeDto[];
}

// Tab 6 — Permit matrix
export class PermitCostRowDto {
  @IsInt() vehicleTypeId: number;
  @IsString() sourceState: string;         // "TN"
  // Record<destState, amount>
  costs: Record<string, string | number>;  // e.g., { KL: "1200", KA: 800 }
}
export class UpsertPermitCostsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => PermitCostRowDto)
  rows: PermitCostRowDto[];
}
