import { TripTypesService } from './trip-types.service';
import { CreateTripTypeDto } from './dto/create-trip-type.dto';
import { UpdateTripTypeDto } from './dto/update-trip-type.dto';
export declare class TripTypesController {
    private readonly tripTypesService;
    constructor(tripTypesService: TripTypesService);
    create(dto: CreateTripTypeDto): import(".prisma/client").Prisma.Prisma__TripTypeClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        label: string;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        label: string;
    }, unknown, never> & {})[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__TripTypeClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        label: string;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    update(id: number, dto: UpdateTripTypeDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        label: string;
    }, unknown, never> & {}>;
    remove(id: number): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        label: string;
    }, unknown, never> & {}>;
}
