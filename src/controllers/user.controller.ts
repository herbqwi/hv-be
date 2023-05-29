import mongoose from "mongoose";
import { IDatabase, IKeys } from "../interfaces";
import User from "../models/user.model";
import { generateJWT } from "../services/general.service";
import jwt from 'jsonwebtoken'

export const createNewUser = async (identification: string, password: string, keys: IKeys.Keys): Promise<string | null> => {
  const newUser = new User({ identification, password, keys });
  try {
    await newUser.save();
    return await generateJWT(identification);
  } catch (err: any) {
    return null;
  }
}

export const getUserData = async (identification: string) => {
  if (identification == null) return null;

  const user = await User.findOne({ _id: identification });
  return user;
}

export const getUserKeys = async (identification: string) => {
  const user = await getUserData(identification);
  return user?.keys as IKeys.Keys;
}

export const authUser = async (identification: string, password: string) => {
  const user = await User.findOne({ identification, password });
  return user?.keys ? { token: await generateJWT(identification), keys: user?.keys, fingerprint: user?.fingerprint } : null
}

export const authToken = async (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, "my_key", async (err: any, decoded: any) => {
      if (err) {
        reject(null);
        return null;
      }
      const identification = decoded?.identification;
      if (!identification) reject(null);
      const user = await User.findOne({ identification });
      resolve(user?.keys ? { token: await generateJWT(identification), keys: user?.keys, fingerprint: user?.fingerprint } : null);
    })
  })
}

export const deleteUser = async (_id: string) => {
  const deletedUser = await User.findOneAndDelete({ _id });
  return deletedUser != null;
}