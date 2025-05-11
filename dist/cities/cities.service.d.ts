import { PrismaService } from '../prisma/prisma.service';
export declare class CitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        state: string;
    }): import(".prisma/client").Prisma.Prisma__CityClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        state: string;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        state: string;
    }, unknown, never> & {})[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__CityClient<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        state: string;
    }, unknown, never> & {}, never, import("@prisma/client/runtime").DefaultArgs>;
    update(id: number, data: {
        name?: string;
        state?: string;
    }): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        state: string;
    }, unknown, never> & {}>;
    remove(id: number): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        state: string;
    }, unknown, never> & {}>;
    private findOneOrFail;
}
