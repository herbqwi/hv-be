import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { IElection } from '../interfaces';
import { IDatabase } from '../interfaces';
import { paillerAddition, paillerDecrypt } from './paillier.service';
import Election from '../models/election.model';
export const generateRandomNumber = () => Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

export const generateJWT = async (identification: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const token = jwt.sign({ identification }, "my_key");
      resolve(token);
    } catch (e) {
      reject(e);
    }
  })
}

export const generateRandomString = (length = 9) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export const calcElectionResult = async (election: IDatabase.Election) => {
  let candidatesResult: any = election.candidates.map(candidate => ({ id: candidate.id, votes: null }));
  for (let i = 0; i < election.votes.length; i++) {
    for (let j = 0; j < election.votes[i].votes.length; j++) {
      if (candidatesResult[j].votes == null) {
        candidatesResult[j].votes = ((election.votes[i].votes[j] as any).hasVoted as unknown as string)
      } else {
        const additionResult = await paillerAddition(BigInt(((election.votes[i].votes[j] as any).hasVoted as unknown as string)), BigInt(candidatesResult[j].votes), (election.keys.publicKey as any));
        candidatesResult[j].votes = additionResult;
      }
    }
  }

  for (const candidate of candidatesResult) {
    if (candidate.votes != null) {
      candidate.votes = await paillerDecrypt(candidate.votes, election.keys.publicKey as any, election.keys.privateKey as any);
    }
  }

  await Election.findOneAndUpdate({ _id: (election as any)._id }, { result: candidatesResult })
  return candidatesResult;
}