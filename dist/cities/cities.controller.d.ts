import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
export declare class CitiesController {
    private readonly citiesService;
    constructor(citiesService: CitiesService);
    create(dto: CreateCityDto): import(".prisma/client").Prisma.Prisma__CityClient<import("@prisma/client/runtime").GetResult<{
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
    update(id: number, dto: UpdateCityDto): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        state: string;
    }, unknown, never> & {}>;
    remove(id: number): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        state: string;
    }, unknown, never> & {}>;
}
