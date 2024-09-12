import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './dtos';
import { PollsService } from './polls.service';
import { RequestWithAuth } from 'src/common/types';
import { ControllerAuthGuard } from './guard/controller-auth.guard';

@UsePipes(new ValidationPipe())
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get()
  pollsGet() {
    console.log('Polls get.....................');
  }

  @Post()
  create(@Body() createPollDto: CreatePollDto) {
    return this.pollsService.createPoll(createPollDto);
  }

  @Post('join')
  join(@Body() joinPollDto: JoinPollDto) {
    return this.pollsService.joinPoll(joinPollDto);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('rejoin')
  rejoin(@Req() request: RequestWithAuth) {
    const { pollID, userID, name } = request;
    return this.pollsService.rejoinPoll({
      pollID,
      userID,
      name,
    });
  }
}
