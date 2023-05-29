import jwt from 'jsonwebtoken';

export const authorizeUser = (req: any, res: any, next: any) => {
  const { authorization } = req.headers;
  jwt.verify(authorization, "my_key", (err: any, decoded: any) => {
    if (err) {
      res.sendStatus(401);
      return;
    }
    next();
  })
}