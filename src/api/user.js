import { Router } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/user';

const router = Router();

router.put('/:userId/update', ({ body: { name, value }, params: { userId } }, res) => {
  User
    .findOneAndUpdate({ _id: userId }, { $set: { [name]: value } })
    .populate('friends')
    .exec((err, user) => {
      if (err) return res.send({ message: 'Something went wrong while updating your user.' });
      if (name === 'remainingFiles' && value >= 20 && !user.isPro) {
        value = 19;
      }

      const { _id, username, email, placeholderColor, discriminator, profilePic, isPro, remainingBytes, remainingFiles, role } = user;
      const tokenObj = { id: _id, username, email, placeholderColor, discriminator, profilePic, isPro, remainingBytes, remainingFiles, role };
      if (tokenObj.hasOwnProperty(name) || name === '_id') {
        tokenObj[name] = value;
      }
      const token = jwt.sign(tokenObj, process.env.JWT_SECRET);

      res.send({ token });
    });
});

router.get('/:userId/friends', ({ params: { userId } }, res) => {
  User.findOne({ _id: userId })
    .populate('friends')
    .exec((err, user) => {
      if (err) return res.status(401).send({ message: err.message });
      if (!user) return res.status(401).send({ message: `Couldn\'t find user with id: ${userId}` });

      const { friends } = user;

      res.status(200).send({ friends });
    });
});

export default router;
