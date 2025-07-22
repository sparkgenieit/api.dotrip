import { Controller, Post, Get, Param, Res } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Response } from 'express';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll() {
    return this.invoiceService.getAllInvoices();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.getInvoiceById(Number(id));
  }

  @Get(':id/download')
async downloadInvoice(@Param('id') id: number, @Res() res: Response) {
  const buffer = await this.invoiceService.generateInvoicePdf(id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);

  res.end(buffer);
}


  // ✅ NEW: Generate Invoice from Trip
  @Post('generate/:tripId')
  async generate(@Param('tripId') tripId: string) {
    return this.invoiceService.generateInvoice(Number(tripId));
  }
}
