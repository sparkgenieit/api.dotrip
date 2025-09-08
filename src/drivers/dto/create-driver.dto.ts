import { Transform } from 'class-transformer';
import { IsString, IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';

// Helpers for transforming FormData values safely
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

export class CreateDriverDto {
  // Required basics
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  licenseNumber: string;

  @IsDateString()
  licenseExpiry: string; // YYYY-MM-DD

  // Flags from FormData (string -> boolean)
  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  isPartTime?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(toOptionalBool)
  isAvailable?: boolean;

  // Role-aware IDs (string -> number)
  @IsOptional()
  @IsInt()
  @Transform(toOptionalInt)
  vendorId?: number;

  // If you allow assign-on-create (DriverForm sends `vehicleId` when a vehicle is chosen)
  @IsOptional()
  @IsInt()
  @Transform(toOptionalInt)
  vehicleId?: number;

  @IsOptional()
  @IsInt()
  @Transform(toOptionalInt)
  userId?: number;

  // File paths (controller fills these from Multer)
  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  licenseImage?: string;

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  rcImage?: string;

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  profileImage?: string; // NEW

  // --- New profile fields from the form ---
  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  whatsappPhone?: string;

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  altPhone?: string;

  @IsOptional()
  @IsDateString()
  licenseIssueDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  dob?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  gender?: string; // "Male" | "Female" | "Other"

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  bloodGroup?: string; // "A+" | "O-" ...

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  aadhaarNumber?: string;

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  panNumber?: string;

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  voterId?: string;

  @IsOptional()
  @IsString()
  @Transform(toOptionalString)
  address?: string;
}