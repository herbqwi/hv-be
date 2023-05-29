export namespace IKeys {
  export type PublicKey = string;
  export type PrivateKey = string;
  export type IV = string;

  export interface Keys {
    publicKey: PublicKey,
    privateKey: PrivateKey,
    iv?: IV
  }
}

export namespace Paillier {
  export interface PublicKey {
    n: string,
    g: string,
  }
  export interface PrivateKey {
    lambda: string,
    mu: string,
    publicKey?: PublicKey,
  }
  export interface Keys {
    publicKey: PublicKey,
    privateKey: PrivateKey,
  }
}

export namespace IElection {
  export enum ELECTION_TYPE {
    ONLINE,
    ANONYMOUS,
    NORMAL
  }

  export interface Candidate {
    id: string,
    name: string,
    description: string,
    image: string,
    accepted?: boolean,
    keyPublished?: boolean,
  }

  export interface VotingRecord {
    id: string,
    votes: { id?: string, hasVoted?: boolean }[],
    signature: string,
    timestamp?: number,
  }

  export interface Vote {
    id: string,
    votes: VotingRecord[],
    signature: string,
    timestamp: number,
  }

  export interface Interest {
    id: string,
  }

  export interface Date {
    start: number,
    finish: number
  }
}

export namespace IDatabase {
  export interface User extends Document {
    identification: string;
    email?: string;
    password: string;
    name: {
      firstName: string;
      lastName: string;
    };
    profileImage?: string;
    phoneNumber?: string;
    keys: IKeys.Keys;
    createdAt: Date;
    updatedAt: Date;
    fingerprint: string,
  }

  export interface Election extends Document {
    title: string;
    candidates: IElection.Candidate[];
    dates: IElection.Date;
    interests: IElection.Interest[],
    color: string,
    keys: IKeys.Keys;
    maxVotes: number,
    votes: IElection.Vote[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: any,
    verifyId: string,
    result: {id: string, votes: string | null}[],
    electionType: number,
  }
}