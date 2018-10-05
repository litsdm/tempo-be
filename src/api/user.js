import { Router } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/user';

const router = Router();

router.put('/:userId/update', ({ body: { name, value }, params: { userId } }, res) => {
  User.findOneAndUpdate({ _id: userId }, { $set: { [name]: value } }, (err, user) => {
    if (err) res.send({ err: 'Something went wrong while updating your user.' });
    const { _id, username, email } = user;
    const tokenObj = { id: _id, username, email };
    if (name === 'username' || name === 'email' || name === '_id') {
      tokenObj[name] = value;
    }
    const token = jwt.sign(tokenObj, process.env.JWT_SECRET);

    res.send({ token });
  });
});

export default router;
