import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsInt, IsDateString } from 'class-validator';

// Helpers to safely coerce FormData values
const toOptionalBool = ({ value }: { value: any }) =>
  value === true || value === 'true' ? true :
  value === false || value === 'false' ? false :
  undefined;

const toOptionalInt = ({ value }: { value: any }) => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
};

const toOptionalString = ({ value }: { value: any }) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return value;
  const v = value.trim();
  return v === '' ? undefined : v;
};

export class UpdateDriverDto {
  // basics
  @IsOptional() @IsString() @Transform(toOptionalString) fullName?: string;
  @IsOptional() @IsString() @Transform(toOptionalString) phone?: string;
  @IsOptional() @IsString() @Transform(toOptionalString) email?: string;

  @IsOptional() @IsString() @Transform(toOptionalString) licenseNumber?: string;
  @IsOptional() @IsDateString() licenseExpiry?: string; // YYYY-MM-DD

  // flags
  @IsOptional() @IsBoolean() @Transform(toOptionalBool) isPartTime?: boolean;
  @IsOptional() @IsBoolean() @Transform(toOptionalBool) isAvailable?: boolean;

  // relations / ids
  @IsOptional() @IsInt() @Transform(toOptionalInt) vendorId?: number;
  @IsOptional() @IsInt() @Transform(toOptionalInt) assignedVehicleId?: number; // prefer PATCH /drivers/assign, but allowed here
  @IsOptional() @IsInt() @Transform(toOptionalInt) userId?: number;

  // images (paths set by controller when files uploaded)
  @IsOptional() @IsString() @Transform(toOptionalString) licenseImage?: string;
  @IsOptional() @IsString() @Transform(toOptionalString) rcImage?: string;
  @IsOptional() @IsString() @Transform(toOptionalString) profileImage?: string;

  // new profile fields (aligns with DriverForm)
  @IsOptional() @IsString() @Transform(toOptionalString) whatsappPhone?: string;
  @IsOptional() @IsString() @Transform(toOptionalString) altPhone?: string;
  @IsOptional() @IsDateString() licenseIssueDate?: string; // YYYY-MM-DD
  @IsOptional() @IsDateString() dob?: string;               // YYYY-MM-DD
  @IsOptional() @IsString() @Transform(toOptionalString) gender?: string;       // "Male" | "Female" | "Other"
  @IsOptional() @IsString() @Transform(toOptionalString) bloodGroup?: string;   // "A+" | "O-" ...
  @IsOptional() @IsString() @Transform(toOptionalString) aadhaarNumber?: string;
  @IsOptional() @IsString() @Transform(toOptionalString) panNumber?: string;
  @IsOptional() @IsString() @Transform(toOptionalString) voterId?: string;
  @IsOptional() @IsString() @Transform(toOptionalString) address?: string;
}