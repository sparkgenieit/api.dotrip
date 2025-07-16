import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { ApproveQuoteDto } from './dto/approve-quote.dto';
import { ShareBookingDto } from './dto/share-booking.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

@Post('share')
async shareBooking(@Body() body: { bookingId: number }) {
  const { bookingId } = body;
  return this.quotesService.shareToVendors(bookingId);
}

  @Get('shared-bookings')
  getSharedBookings() {
    return this.quotesService.getSharedBookings();
  }

  @Post('submit')
  submitQuote(@Body() dto: SubmitQuoteDto) {
    return this.quotesService.submitQuote(dto);
  }

  @Get(':bookingId')
  getQuotes(@Param('bookingId') bookingId: string) {
    return this.quotesService.getQuotesForBooking(+bookingId);
  }

  @Post('approve')
  approveQuote(@Body() dto: ApproveQuoteDto) {
    return this.quotesService.approveQuote(dto.quoteId);
  }
}
