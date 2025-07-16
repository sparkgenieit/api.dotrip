import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { EmailService } from '../services/email.service';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async shareToVendors(bookingId: number) {
    console.log(bookingId);
    const vendors = await this.prisma.user.findMany({
      where: { role: 'VENDOR' },
      select: { id: true, email: true, name: true },
    });

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pickupAddress: true,
        dropAddress: true,
        vehicleType: true,
      },
    });

    if (!booking) {
      throw new Error(`❌ Booking with ID ${bookingId} not found`);
    }

    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3005';
    const bookingLink = `${adminUrl}/dashboard/bookings/view/?bookingId=${bookingId}`;

    for (const vendor of vendors) {
      if (!vendor.email) continue;

      await this.emailService.sendTemplate(
        vendor.email,
        'New Quote Opportunity',
        'vendor-quote',
        {
          name: vendor.name || 'Vendor',
          vehicle: booking.vehicleType?.name || 'N/A',
          pickup: booking.pickupAddress?.address || 'N/A',
          drop: booking.dropAddress?.address || 'N/A',
          link: bookingLink,
        }
      );
    }

    return {
      success: true,
      vendorsEmailed: vendors.length,
      bookingLink,
    };
  }

  async getSharedBookings() {
    return this.prisma.booking.findMany({
      where: {
        status: 'Confirmed',
        vendorId: null,
      },
      include: {
        pickupAddress: true,
        dropAddress: true,
        vehicleType: true,
      },
    });
  }

  async submitQuote(dto: SubmitQuoteDto, vendorId: number) {
  return this.prisma.quote.create({
    data: {
      bookingId: dto.bookingId,
      vendorId: vendorId, // ✅ passed from req.user.id
      amount: dto.amount,
    },
  });
}

  async getQuotesForBooking(bookingId: number) {
    return this.prisma.quote.findMany({
      where: { bookingId },
      include: { vendor: true },
    });
  }

  async approveQuote(quoteId: number) {
    const quote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: { approved: true },
    });

    await this.prisma.booking.update({
      where: { id: quote.bookingId },
      data: { vendorId: quote.vendorId },
    });

    return { success: true };
  }
}
