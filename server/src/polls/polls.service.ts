import { Injectable } from '@nestjs/common';
import { CreatePollFields, JoinPollFields, RejoinPollFields } from './types';
import { createPollID, createUserID } from 'src/ids';
import { PollsRepository } from './polls.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PollsService {
  constructor(
    private readonly pollsDB: PollsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createPoll(fields: CreatePollFields) {
    const pollID = createPollID();
    const userID = createUserID();

    const createdPoll = await this.pollsDB.createPoll({
      ...fields,
      pollID,
      userID,
    });

    // Create an accessToken based off of pollID and userID

    const signedString = this.jwtService.sign(
      {
        pollID: createdPoll.id,
        name: fields.name,
      },
      {
        subject: userID,
      },
    );

    return {
      poll: createdPoll,
      accessToken: signedString,
    };
  }

  async joinPoll(fields: JoinPollFields) {
    const userID = createUserID();

    const joinedPoll = await this.pollsDB.getPoll(fields.pollID);

    // Create an accessToken based off of pollID and userID

    const signedString = this.jwtService.sign(
      {
        pollID: joinedPoll.id,
        name: fields.name,
      },
      {
        subject: userID,
      },
    );

    return {
      poll: joinedPoll,
      accessToken: signedString,
    };
  }

  async rejoinPoll(fields: RejoinPollFields) {
    const joinedPoll = await this.pollsDB.addParticipant(fields);

    return joinedPoll;
  }
}
