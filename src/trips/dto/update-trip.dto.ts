
export class UpdateTripDto {
  bookingId?: number;
  riderId?: number;
  driverId?: number;
  vehicleId?: number;
  vendorId?: number;
  corporateBookingId?: number;
  startTime?: Date;
  endTime?: Date;
  status?: string;
  distance?: number;
  fare?: number;
  breakdownReported?: boolean;
  breakdownNotes?: string;
}
