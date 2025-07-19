import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { ApproveQuoteDto } from './dto/approve-quote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../types/auth-request';

@Controller('quotes')
@UseGuards(JwtAuthGuard) // ✅ guard applied globally (like driver controller)
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

  @Post()
  createQuote(@Body() dto: SubmitQuoteDto, @Req() req: AuthRequest) {
    const user = req.user;

    if (!user || user.role !== 'VENDOR') {
      throw new NotFoundException('Only vendors can submit quotes');
    }

    return this.quotesService.submitQuote(dto, user.id); // ✅ vendorId passed from token
  }

  @Get(':bookingId')
  getQuotes(@Param('bookingId') bookingId: string) {
    return this.quotesService.getQuotesForBooking(+bookingId);
  }

@Post('approve')
approve(@Body() body: { quoteId: number }, @Req() req: AuthRequest) {
  console.log('Received body:', body);
  return this.quotesService.approveQuote(body.quoteId, req.user);
}

}
