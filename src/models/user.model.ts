import mongoose, { Schema } from 'mongoose';
import { IDatabase } from '../interfaces';

const userSchema = new Schema<IDatabase.User>({
  identification: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  name: {
    firstName: String,
    lastName: String
  },
  profileImage: String,
  phoneNumber: {
    type: String,
  },
  keys: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  fingerprint: {
    type: String,
  },
})



const User = mongoose.model<IDatabase.User>('User', userSchema);

export default User;