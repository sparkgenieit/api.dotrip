import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(dto: CreateBookingDto): import(".prisma/client").Prisma.Prisma__BookingClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        userId: number;
        vehicleId: number;
        fromCityId: number;
        toCityId: number;
        pickupDateTime: Date;
        tripTypeId: number;
        fare: number;
        createdAt: Date;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        userId: number;
        vehicleId: number;
        fromCityId: number;
        toCityId: number;
        pickupDateTime: Date;
        tripTypeId: number;
        fare: number;
        createdAt: Date;
    }, unknown, never> & {})[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__BookingClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        userId: number;
        vehicleId: number;
        fromCityId: number;
        toCityId: number;
        pickupDateTime: Date;
        tripTypeId: number;
        fare: number;
        createdAt: Date;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    update(id: number, dto: UpdateBookingDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        userId: number;
        vehicleId: number;
        fromCityId: number;
        toCityId: number;
        pickupDateTime: Date;
        tripTypeId: number;
        fare: number;
        createdAt: Date;
    }, unknown, never> & {}>;
    remove(id: number): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        userId: number;
        vehicleId: number;
        fromCityId: number;
        toCityId: number;
        pickupDateTime: Date;
        tripTypeId: number;
        fare: number;
        createdAt: Date;
    }, unknown, never> & {}>;
}
