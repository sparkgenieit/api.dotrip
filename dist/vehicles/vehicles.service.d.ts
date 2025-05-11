import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVehicleDto): import(".prisma/client").Prisma.Prisma__VehicleClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        registrationNumber: string;
        name: string;
        model: string;
        image: string;
        capacity: number;
        price: number;
        originalPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        registrationNumber: string;
        name: string;
        model: string;
        image: string;
        capacity: number;
        price: number;
        originalPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {})[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__VehicleClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        registrationNumber: string;
        name: string;
        model: string;
        image: string;
        capacity: number;
        price: number;
        originalPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    update(id: number, dto: UpdateVehicleDto): import(".prisma/client").Prisma.Prisma__VehicleClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        registrationNumber: string;
        name: string;
        model: string;
        image: string;
        capacity: number;
        price: number;
        originalPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__VehicleClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        registrationNumber: string;
        name: string;
        model: string;
        image: string;
        capacity: number;
        price: number;
        originalPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
}
