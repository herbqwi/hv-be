import { IDatabase, IElection, IKeys } from "../interfaces";
import User from "../models/user.model";
import Election from "../models/election.model";
import { calcElectionResult, generateRandomString } from "../services/general.service";

export const createNewElection = async (title: string, candidates: IElection.Candidate[], dates: IElection.Date, keys: IKeys.Keys, maxVotes: number, createdBy: string, electionType: IElection.ELECTION_TYPE) => {
  console.log({ createdBy });
  const newCands = candidates.map(candidate => ({ ...candidate, accepted: false, keyPublished: false }));
  const newElection = new Election({ title, candidates: newCands, dates, keys, maxVotes, createdBy, verifyId: generateRandomString(), electionType: electionType });
  try {
    return await newElection.save();
  } catch (err: any) {
    console.log(err)
    return null;
  }
}

export const acceptElection = async (identification: string, electionId: string) => {
  console.log({ identification, electionId });

  try {
    const election = await Election.findById(electionId);
    console.log(`r1`);

    if (!election) {
      console.log('Election not found.');
      return null;
    }
    console.log(`r2`);

    const candidateIndex = election.candidates.findIndex(
      (candidate) => candidate.id === identification
    );
    console.log(`r3: `);

    if (candidateIndex === -1) {
      console.log('Candidate not found.');
      return null;
    }

    console.log(election.candidates[candidateIndex]);

    election.candidates[candidateIndex].accepted = true;
    election.markModified('candidates');


    const updatedElection = await election.save();
    return updatedElection;
  } catch (err: any) {
    console.error('Error in acceptElection:', err);
    return null;
  }
};

export const declineElection = async (identification: string, electionId: string) => {
  console.log({ identification, electionId });

  try {
    const election = await Election.findById(electionId);
    console.log(`r1`);

    if (!election) {
      console.log('Election not found.');
      return null;
    }
    console.log(`r2`);

    const candidateIndex = election.candidates.findIndex(
      (candidate) => candidate.id === identification
    );

    if (candidateIndex === -1) {
      console.log('Candidate not found.');
      return null;
    }

    return await deleteElection(electionId);
  } catch (err: any) {
    console.error('Error in acceptElection:', err);
    return null;
  }
};

export const publishKey = async (identification: string, electionId: string) => {
  try {
    const election = await Election.findById(electionId);

    if (!election) {
      console.log('Election not found.');
      return null;
    }

    const candidateIndex = election.candidates.findIndex(
      (candidate) => candidate.id === identification
    );

    if (candidateIndex === -1) {
      console.log('Candidate not found.');
      return null;
    }

    election.candidates[candidateIndex].keyPublished = true;

    if (!election.candidates.find(candidate => !candidate.keyPublished)) {
      await calcElectionResult(election)
    }

    election.markModified('candidates');
    const updatedElection = await election.save();


    return updatedElection;
  } catch (err: any) {
    console.error('Error in publishKey:', err);
    return null;
  }
};


export const getElections = async () => {
  let elections = await Election.find({})
  const newElections = [];
  for (let i = 0; i < elections.length; i++) {
    let tf = true;
    for (let j = 0; j < elections[i].candidates.length; j++) {
      if (!elections[i].candidates[j].accepted) {
        tf = false;
        break;
      }
    }
    if (tf) newElections.push(elections[i]);
  }
  return newElections;
}

export const getFilteredElections = async (filter: any) => {
  let elections = await Election.find(filter);
  return elections;
}

export const getUserElections = async (userId: string) => {
  if (userId == null) return null;
  const elections = await Election.find({
    $or: [
      { createdBy: userId },
      { 'candidates.id': userId }
    ]
  });
  return elections;
}

export const getElection = async (_id: string) => {
  return (await Election.find({ _id }))[0] as IDatabase.Election
}

export const getVerifyElection = async (verifyId: string) => {
  return (await Election.findOne({ verifyId: verifyId })) as IDatabase.Election
}

export const addInterest = async (userId: string, electionId: string) => {
  const election = Election.findOne({ _id: electionId });
}

export const deleteElection = async (_id: string) => {
  const deletedElection = await Election.findOneAndDelete({ _id });
  return deletedElection != null;
}