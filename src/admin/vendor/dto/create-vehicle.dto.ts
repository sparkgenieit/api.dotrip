export class CreateVehicleDto {
  name: string;
  model: string;
  image: string;
  capacity: number;
  price?: number;
  originalPrice?: number;
  vendorId?: number;
}