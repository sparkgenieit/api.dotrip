export class CreateDriverDto {
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  license_expiry: string;
  is_part_time?: boolean;
  is_available?: boolean;
  vendor_id: string;
  assigned_vehicle_id?: string;
}
