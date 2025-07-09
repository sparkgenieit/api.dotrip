import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; state: string }) {
    return this.prisma.city.create({ data });
  }
  async createMany(data: { name: string; state: string }[]) {
    return this.prisma.city.createMany({ data });
  }
  findAll() {
    return this.prisma.city.findMany();
  }

  findOne(id: number) {
    return this.prisma.city.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string; state?: string }) {
    await this.findOneOrFail(id);
    return this.prisma.city.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.city.delete({ where: { id } });
  }

  private async findOneOrFail(id: number) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException(`City with id ${id} not found`);
    return city;
  }

  async calculateTotalDistance(cityIds: number[]) {
    const cities = await this.prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true, lat: true, lng: true },
    });

    if (cities.length !== cityIds.length) {
      throw new NotFoundException('One or more city IDs are invalid');
    }

    // Map by ID for fast lookup
    const cityMap = new Map(cities.map(c => [c.id, c]));

    // Ordered path
    const ordered = cityIds.map(id => cityMap.get(id));
    const originalDistance = this.getTotalDistance(ordered);

    // Optimize route
    const [start, ...stopsAndEnd] = ordered;
    const end = stopsAndEnd.pop(); // last item is drop
    const permutations = this.permute(stopsAndEnd);

    let bestOrder = stopsAndEnd;
    let bestDistance = Infinity;

    for (const perm of permutations) {
      const path = [start, ...perm, end];
      const dist = this.getTotalDistance(path);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestOrder = perm;
      }
    }

    const optimizedPath = [start.id, ...bestOrder.map(c => c.id), end.id];

    return {
      originalPath: cityIds,
      originalDistanceKm: parseFloat(originalDistance.toFixed(2)),
      optimizedPath,
      optimizedDistanceKm: parseFloat(bestDistance.toFixed(2)),
    };
  }

  private getTotalDistance(path: any[]): number {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      total += this.haversineDistance(path[i], path[i + 1]);
    }
    return total;
  }

  private haversineDistance(a: any, b: any): number {
    const toRad = (val: number) => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const A =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
    return R * C;
  }

  private permute(arr: any[]): any[][] {
    if (arr.length <= 1) return [arr];
    const result: any[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of this.permute(remaining)) {
        result.push([current, ...perm]);
      }
    }
    return result;
  }
}
