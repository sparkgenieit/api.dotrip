// === FILE: src/vendors/vendors.controller.ts ==================================
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import {
  CreateVendorDto, UpdateVendorDto, UpsertBranchesDto,
  UpsertDriverCostsDto, UpsertExtraCostsDto, UpsertLocalLimitsDto, UpsertLocalChargesDto,
  UpsertOutstationLimitsDto, UpsertOutstationChargesDto, UpsertPermitCostsDto,
} from './dto/vendor.dto';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly svc: VendorsService) {}

    @Get('vehicle-types')
    listVehicleTypes() {
        return this.svc.listVehicleTypes();
    }

  // ---- Tab 1: Basic Info ----
  @Post()
  async create(@Body() dto: CreateVendorDto) {
    const v = await this.svc.createVendor(dto);
    return { id: v.id };
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVendorDto) {
    return this.svc.updateVendor(id, dto);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getVendor(id);
  }

  // ---- Tab 2: Branches ----
  @Get(':id/branches')
  listBranches(@Param('id', ParseIntPipe) id: number) {
    return this.svc.listBranches(id);
  }

  @Put(':id/branches')
  upsertBranches(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertBranchesDto) {
    return this.svc.upsertBranches(id, dto);
  }

  // ---- Tabs 3 & 5: Driver Cost ----
  @Get(':id/driver-costs')
  listDriverCosts(@Param('id', ParseIntPipe) id: number) {
    return this.svc.listDriverCosts(id);
  }

  @Put(':id/driver-costs')
  upsertDriverCosts(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertDriverCostsDto) {
    return this.svc.upsertDriverCosts(id, dto);
  }

  // ---- Tab 5: Extra costs ----
  @Put(':id/extra-costs')
  upsertExtraCosts(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertExtraCostsDto) {
    return this.svc.upsertExtraCosts(id, dto);
  }

  // ---- Tab 5: Extra costs (READ) ----
@Get(':id/extra-costs')
listExtraCosts(@Param('id', ParseIntPipe) id: number) {
  return this.svc.listExtraCosts(id);
}

// ---- Vendor margin only (UPDATE) ----
@Put(':id/margin')
updateMargin(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: { vendorMarginPercent?: number | string; vendorMarginGstType?: 'Included' | 'Excluded'; vendorMarginGstPct?: number | string }
) {
  return this.svc.updateVendorMargin(id, body as any);
}

  // ---- Tabs 3 & 5: Local limits + charges ----
  @Get(':id/local')
  listLocal(@Param('id', ParseIntPipe) id: number) {
    return this.svc.listLocal(id);
  }

  @Put(':id/local-limits')
  replaceLocalLimits(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertLocalLimitsDto) {
    return this.svc.replaceLocalLimits(id, dto);
  }

  @Put(':id/local-charges')
  upsertLocalCharges(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertLocalChargesDto) {
    return this.svc.upsertLocalCharges(id, dto);
  }

  // ---- Tabs 3 & 5: Outstation limits + charges ----
  @Get(':id/outstation')
  listOutstation(@Param('id', ParseIntPipe) id: number) {
    return this.svc.listOutstation(id);
  }

  @Put(':id/outstation-limits')
  replaceOutstationLimits(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertOutstationLimitsDto) {
    return this.svc.replaceOutstationLimits(id, dto);
  }

  @Put(':id/outstation-charges')
  upsertOutstationCharges(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertOutstationChargesDto) {
    return this.svc.upsertOutstationCharges(id, dto);
  }

  // ---- Tab 6: Permit matrix ----
  @Get(':id/permit-costs')
  listPermitCosts(@Param('id', ParseIntPipe) id: number) {
    return this.svc.listPermitCosts(id);
  }

  @Put(':id/permit-costs')
  upsertPermit(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertPermitCostsDto) {
    return this.svc.upsertPermitCosts(id, dto);
  }
}
