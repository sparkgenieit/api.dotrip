import { Controller, Post, Get, Param, Res, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Response } from 'express';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // ✅ GET /invoice - all invoices
  @Get()
  async findAll() {
    return this.invoiceService.getAllInvoices();
  }

  // ✅ GET /invoice/:id - get invoice by ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.getInvoiceById(id);
  }

  // ✅ POST /invoice/generate/:tripId - create invoice
  @Post('generate/:tripId')
  async generate(@Param('tripId', ParseIntPipe) tripId: number) {
    return this.invoiceService.generateInvoice(tripId);
  }

  // ✅ GET /invoice/download/:id - stream working PDF
  @Get('download/:id')
  async downloadInvoice(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buffer = await this.invoiceService.generateInvoicePdf(id);
    if (!buffer) throw new NotFoundException('Unable to generate PDF');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    return res.send(buffer);
  }
}
