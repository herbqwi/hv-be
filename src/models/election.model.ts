import mongoose, { Schema } from 'mongoose';
import { IDatabase } from '../interfaces';

const electionSchema = new Schema<IDatabase.Election>({
  title: {
    type: String,
    required: true,
    unique: true
  },
  candidates: {
    type: [Object],
    required: true
  },
  dates: {
    type: Object,
    required: true
  },
  interests: {
    type: [Object],
    default: []
  },
  color: String,
  keys: {
    type: Object,
    required: true
  },
  maxVotes: {
    type: Number,
    default: 1,
  },
  votes: {
    type: [Object],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true,
  },
  verifyId: {
    type: String,
    required: true,
  },
  electionType: {
    type: Number,
    required: true,
  },
  result: {
    type: [Object],
    default: null
  }
})



const Election = mongoose.model<IDatabase.Election>('Election', electionSchema);

export default Election;