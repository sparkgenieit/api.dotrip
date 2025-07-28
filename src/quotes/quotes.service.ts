import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { EmailService } from '../services/email.service';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

 async shareToVendors(bookingId: number) {
  console.log(`🔍 Sharing Booking ID: ${bookingId}`);

  // ✅ Step 1: Check if a quote is already approved
  const alreadyApproved = await this.prisma.quote.findFirst({
    where: { bookingId, approved: true },
  });

  if (alreadyApproved) {
    return {
      success: false,
      message: `Quote already approved for booking ${bookingId}. Skipping vendor email.`,
    };
  }

  // ✅ Step 2: Fetch all vendors
  const vendors = await this.prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: { id: true, email: true, name: true },
  });

  // ✅ Step 3: Get booking details
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

// ✅ Step 4: Loop through vendors and send emails with error handling
const failedVendors: string[] = [];
let sentCount = 0;

for (const vendor of vendors) {
  if (!vendor.email) continue;

  try {
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
    sentCount++;
  } catch (err) {
    console.error(`❌ Failed to send to vendor ${vendor.email}: ${err.message}`);
    failedVendors.push(vendor.email);
  }
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

async submitQuote(dto: SubmitQuoteDto, userId: number) {
  // ✅ Step 1: Find the vendor linked to the logged-in user
  const vendor = await this.prisma.vendor.findUnique({
    where: { userId },
  });

  if (!vendor) {
    throw new Error(`❌ Vendor not found for user ID ${userId}`);
  }

  // ✅ Step 2: Create the quote with the correct vendor.id
  return this.prisma.quote.create({
    data: {
      bookingId: dto.bookingId,
      vendorId: vendor.id, // ✅ Correct vendor ID from Vendor table
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

async approveQuote(quoteId: number, user: any) {
  // ✅ Role check
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new ForbiddenException('Only admin can approve quotes');
  }

  // ✅ Approve the quote
  const quote = await this.prisma.quote.update({
    where: { id: quoteId },
    data: { approved: true },
  });

  // ✅ Update booking with vendorId
  await this.prisma.booking.update({
    where: { id: quote.bookingId },
    data: { vendorId: quote.vendorId },
  });

  return { success: true };
}
}
