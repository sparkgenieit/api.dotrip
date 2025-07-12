import { Controller, Get, Param } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('admin/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }
}
