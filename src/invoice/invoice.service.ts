import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async getAllInvoices() {
    return this.prisma.invoice.findMany({
  include: {
    user: {
      select: { name: true },
    },
    vendor: {
      select: { name: true },
    },
    trip: {
      include: {
        booking: {
          include: {
            pickupAddress: {
              select: { address: true },
            },
            dropAddress: {
              select: { address: true },
            },
          },
        },
      },
    },
  },
  orderBy: { createdAt: 'desc' },
});

  }

  async getInvoiceById(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        vendor: { select: { name: true } },
        trip: {
          include: {
            booking: {
              select: {
                pickupAddress: true,
                dropAddress: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }
  
   // ✅ INSERTED FUNCTION
  async generateInvoice(tripId: number) {
  const trip = await this.prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      //user: true,
      vendor: true,
      booking: {
        select: {
          fare: true,
          userId: true, // ✅ Ensure this is included for TS safety
        },
      },
    },
  });

  if (!trip) throw new NotFoundException(`Trip with ID ${tripId} not found`);

  const existingInvoice = await this.prisma.invoice.findUnique({
    where: { tripId },
  });

  if (existingInvoice) throw new Error(`Invoice already exists for Trip ID ${tripId}`);

  const subtotal = trip.booking?.fare || 0;
  const vendorCommission = subtotal * 0.85;
  const adminCommission = subtotal * 0.15;
  const totalAmount = subtotal;
  const invoiceNumber = `INV-${Date.now()}`;

  return this.prisma.invoice.create({
    data: {
      invoiceNumber,
      subtotal,
      vendorCommission,
      adminCommission,
      totalAmount,
      pdfUrl: '',
      tripId: trip.id,
      vendorId: trip.vendorId,
      userId: trip.booking.userId,
    },
  });
}


  async generateInvoicePdf(id: number): Promise<Buffer> {
    const invoice = await this.getInvoiceById(id);

    const doc = new PDFDocument();
    const stream = new Readable();
    const buffers: any[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => stream.push(null));

    doc.fontSize(20).text(`Invoice #${invoice.invoiceNumber}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Customer: ${invoice.user?.name}`);
    doc.text(`Vendor: ${invoice.vendor?.name}`);
    doc.text(`Trip: ${invoice.trip?.booking?.pickupAddress.address} → ${invoice.trip?.booking?.dropAddress.address}`);
    doc.moveDown();
    doc.text(`Subtotal: ₹${invoice.subtotal}`);
    doc.text(`Vendor Commission: ₹${invoice.vendorCommission}`);
    doc.text(`Admin Commission: ₹${invoice.adminCommission}`);
    doc.text(`Total Amount: ₹${invoice.totalAmount}`);
    doc.end();

    return await new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    });
  }
}
