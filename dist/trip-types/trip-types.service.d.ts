import { PrismaService } from '../prisma/prisma.service';
export declare class TripTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        label: string;
    }): import(".prisma/client").Prisma.Prisma__TripTypeClient<import("@prisma/client/runtime").GetResult<{
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
    update(id: number, data: {
        label?: string;
    }): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        label: string;
    }, unknown, never> & {}>;
    remove(id: number): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        label: string;
    }, unknown, never> & {}>;
    private findOneOrFail;
}
