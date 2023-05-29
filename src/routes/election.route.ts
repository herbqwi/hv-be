import { Router } from "express";
import { acceptElection, createNewElection, declineElection, deleteElection, getElection, getElections, getFilteredElections, getUserElections, getVerifyElection, publishKey } from "../controllers/election.controller";
import { authToken, authUser, createNewUser, deleteUser } from "../controllers/user.controller";
import User from "../models/user.model";
import jwt from 'jsonwebtoken';
import { encryptData } from "../services/subtle/rsa.service";
import Election from "../models/election.model";
import { generateRandomNumber } from "../services/general.service";

const router = Router()

router.post('/new', async (req, res) => {
  console.log(`new`);
  const { title, candidates, dates, keys, maxVotes, electionType } = req.body;
  console.log(`typeeeeeeeeeeeeeee: `, electionType);
  if (!title || !candidates || !dates || !keys || electionType == null) {
    res.status(400).send("Missing required parameters: title, candidates, dates, keys: (privateKey, publicKey), electionType")
    return;
  }


  const { authorization } = req.headers;
  if (authorization == null) {
    res.status(401).send(`Something went wrong while fetching the elections data from the database`)
    return;
  }

  jwt.verify(authorization, "my_key", async (err: any, decoded: any) => {
    if (err) {
      res.status(401).send(`Something went wrong while fetching the elections data from the database`)
      return;
    }
    const newElection = await createNewElection(title, candidates, { start: dates.start, finish: dates.finish }, keys, maxVotes, decoded?.identification, electionType);
    try {
      if (!newElection) {
        res.status(400).send("Something went wrong while creating the election!");
        return;
      }
      res.status(200).json(newElection);
    } catch {
      res.status(400).send("Something wrong happened");
    }
  })
})

router.put('/:electionId/accept', async (req, res) => {
  console.log(`PUT accept`);
  const { electionId } = req.params;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send(`Authorization header missing.`);
  }

  try {
    const decoded = jwt.verify(authorization, "my_key") as any;
    const { identification } = decoded;

    const result = await acceptElection(identification, electionId);

    if (!result) {
      return res.status(404).send(`Election with ID ${electionId} or candidate with identification ${identification} not found.`);
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Something went wrong while updating the candidate in the election with ID ${electionId}.`);
  }
});

router.put('/:electionId/decline', async (req, res) => {
  console.log(`PUT decline`);
  const { electionId } = req.params;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send(`Authorization header missing.`);
  }

  try {
    const decoded = jwt.verify(authorization, "my_key") as any;
    const { identification } = decoded;

    const result = await declineElection(identification, electionId);

    if (!result) {
      return res.status(404).send(`Election with ID ${electionId} or candidate with identification ${identification} not found.`);
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Something went wrong while updating the candidate in the election with ID ${electionId}.`);
  }
});

router.put('/:electionId/publish', async (req, res) => {
  console.log(`PUT Publish`);
  const { electionId } = req.params;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send(`Authorization header missing.`);
  }

  try {
    const decoded = jwt.verify(authorization, "my_key") as any;
    const { identification } = decoded;
    const result = await publishKey(identification, electionId);

    if (!result) {
      return res.status(404).send(`Election with ID ${electionId} or candidate with identification ${identification} not found.`);
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Something went wrong while updating the candidate in the election with ID ${electionId}.`);
  }
});

router.get('/invites', async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send(`Authorization header missing.`);
  }

  try {
    const decoded = jwt.verify(authorization, "my_key");
    console.log(decoded);
    const { identification } = decoded as any;

    const elections = await Election.find({
      'candidates': {
        $elemMatch: {
          'id': identification,
          $or: [
            { 'accepted': false },
            { 'accepted': { $exists: false } },
          ],
        }
      }
    });

    if (!elections || elections.length === 0) {
      return res.status(404).send(`No elections found with candidate having ID ${identification} and accepted status as false or not existing.`);
    }

    res.status(200).json(elections);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Something went wrong while searching for the candidate.`);
  }
});

router.get(`/`, async (req, res) => {
  try {
    const elections = await getElections();
    res.status(200).json(elections);
  } catch {
    res.status(400).send(`Something went wrong while fetching the elections data from the database`)
  }
})

router.get(`/user`, async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (authorization == null) {
      res.status(401).send(`Something went wrong while fetching the elections data from the database`)
      return;
    }

    jwt.verify(authorization, "my_key", async (err: any, decoded: any) => {
      if (err) {
        res.status(401).send(`Something went wrong while fetching the elections data from the database`)
        return;
      }
      const elections = await getUserElections(decoded?.identification);
      res.status(200).json(elections);
    })
  } catch {
    res.status(400).send(`Something went wrong while fetching the elections data from the database`)
  }
})

router.get('/statistics/:electionId', async (req, res) => {
  const { electionId } = req.params;

  if (!electionId) {
    return res.status(400).send('Election ID is missing.');
  }

  try {
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).send('Election not found.');
    }

    const totalVotes = election.votes.length;

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const votesLast24Hours = election.votes.filter(
      (vote) => new Date(vote.timestamp) >= last24Hours
    ).length;

    const votesLast7Days = election.votes.filter(
      (vote) => new Date(vote.timestamp) >= last7Days
    ).length;

    const statistics = {
      totalVotes,
      votesLast24Hours,
      votesLast7Days,
    };

    res.status(200).json(statistics);
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong while fetching the election statistics.');
  }
});


router.post(`/`, async (req, res) => {
  try {
    const { filter } = req.body;
    const elections = await getFilteredElections(filter);
    res.status(200).json(elections);
  } catch {
    res.status(400).send(`Something went wrong while fetching the elections data from the database`)
  }
})

router.post(`/vote`, async (req, res) => {
  console.log(`POST /vote`);
  try {
    const { votingRecord, electionId } = req.body;
    const election = await Election.findOne({ _id: electionId });
    const random = generateRandomNumber();
    const result = await Election.findOneAndUpdate({ _id: electionId }, { votes: [...(election?.votes != null ? election?.votes : []), { id: random, ...votingRecord }] });
    res.status(200).send({ random });
  } catch {
    res.status(400).send(`Something went wrong while fetching the elections data from the database`)
  }
})

router.get(`/hasVoted/:userId/:electionId`, async (req, res) => {
  const { userId, electionId } = req.params;
  const election = await Election.findOne({ _id: electionId });
  const hasVoted = election?.votes.find(vote => (vote.id == userId));
  res.status(200).send(hasVoted);
})

router.get(`/verify/:verifyId`, async (req, res) => {
  console.log(`GET Verify`);
  const { verifyId } = req.params;
  try {
    const election = await getVerifyElection(verifyId);
    res.status(200).json(election);
  } catch {
    res.status(400).send(`Something went wrong while fetching the election (${verifyId}) data from the database`)
  }
})

router.get(`/verify-vote/:electionId`, async (req, res) => {
  console.log(`GET Verify Vote`);
  const { electionId } = req.params;
  const { authorization } = req.headers;
  try {
    const decoded = jwt.verify(authorization as string, "my_key") as any;
    const { identification } = decoded;
    const vote = (await getElection(electionId)).votes.find(vote => vote.id == identification);
    res.status(200).json(vote);
  } catch {
    res.status(400).send(`Something went wrong while fetching the election (${electionId}) data from the database`)
  }
})

router.get(`/voted-elections`, async (req, res) => {
  console.log(`GET Verify Vote`);
  const { authorization } = req.headers;
  try {
    const decoded = jwt.verify(authorization as string, "my_key") as any;
    const { identification } = decoded;
    const elections = await getElections();
    const votedElections = elections.filter(election => election.votes.find(vote => vote.id == identification));
    res.status(200).json(votedElections);
  } catch {
    res.status(400).send(`Something went wrong while fetching elections data from the database`)
  }
})

router.get(`/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const election = await getElection(id);
    res.status(200).json(election);
  } catch {
    res.status(400).send(`Something went wrong while fetching the election (${id}) data from the database`)
  }
})

router.delete(`/:id`, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send("Missing required parameters: id")
    return
  }

  try {
    const isDeleted = await deleteElection(id);
    res.sendStatus(isDeleted ? 200 : 404);
  } catch {
    res.status(500).send(`Something wrong happend while deleting the election (${id})`)
  }
})



export default router;