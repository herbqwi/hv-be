import { Router } from "express";
import { authToken, authUser, createNewUser, deleteUser } from "../controllers/user.controller";
import User from "../models/user.model";
import { encryptData } from "../services/subtle/rsa.service";

const router = Router()

router.post('/new', async (req, res) => {
  console.log(`new`);
  const { identification, password, keys } = req.body;
  console.log(keys)
  if (!identification || !password || !keys) {
    res.status(400).send("Missing required parameters: identification, password, keys: (privateKey, publicKey)")
    return;
  }

  const generatedToken = await createNewUser(identification, password, keys);
  try {
    if (!generatedToken) {
      res.status(400).send("That identification is already registered!");
      return;
    }
    const encryptedToken = await encryptData(generatedToken, keys.publicKey);
    res.status(200).json({ token: encryptedToken });
  } catch {
    res.status(400).send("Something wrong happened");
  }
})

router.post('/auth', async (req, res) => {
  const { identification, password, token } = req.body;
  if ((!identification || !password) && !token) {
    res.status(400).send("Missing required parameters: identification and password or token")
    return
  }

  const userData = token ? await authToken(token) as any : await authUser(identification, password) as any;
  try {
    if (!userData?.token) {
      res.status(401).send(`Wrong username or password, or there's something wrong with the connection`);
      return;
    }

    const encryptedToken = await encryptData(userData.token, userData.keys.publicKey);
    res.status(200).json({ token: encryptedToken, keys: userData.keys, fingerprint: userData.fingerprint });
  } catch (err: any) {
    console.log(err)
    res.status(400).send("Something wrong happened");
  }
})

router.delete(`/:id`, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send("Missing required parameters: id")
    return
  }

  try {
    const isDeleted = await deleteUser(id);
    res.sendStatus(isDeleted ? 200 : 404);
  } catch {
    res.status(500).send(`Something wrong happend while deleting the user (${id})`)
  }
})



export default router;