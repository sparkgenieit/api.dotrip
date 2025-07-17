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
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.invoiceService.generateInvoicePdf(Number(id));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
    });
    res.send(pdfBuffer);
  }
  // ✅ NEW: Generate Invoice from Trip
  @Post('generate/:tripId')
  async generate(@Param('tripId') tripId: string) {
    return this.invoiceService.generateInvoice(Number(tripId));
  }
}
