import { PrismaService } from '../prisma/prisma.service';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: number;
        vehicleId: number;
        fromCityId: number;
        toCityId: number;
        pickupDateTime: string;
        tripTypeId: number;
        fare: number;
    }): import(".prisma/client").Prisma.Prisma__BookingClient<import("@prisma/client/runtime").GetResult<{
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
    update(id: number, data: any): Promise<import("@prisma/client/runtime").GetResult<{
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
    private findOneOrFail;
}
