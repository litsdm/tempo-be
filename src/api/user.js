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
      const { _id, username, email, placeholderColor, discriminator, profilePic } = user;
      const tokenObj = { id: _id, username, email, placeholderColor, discriminator, profilePic };
      if (name === 'username' || name === 'email' || name === '_id', name === 'placeholderColor', name === 'discriminator', name === 'profilePic') {
        tokenObj[name] = value;
      }
      const token = jwt.sign(tokenObj, process.env.JWT_SECRET);

      res.send({ token });
    });
});

router.get('/:userId/friends', ({ params: { userId } }, res) => {
  User.findOne({ _id: userId })
    .populate('friends')
    .exec((err, { friends }) => {
      if (err) return res.status(401).send({ message: err.message });

      res.status(200).send({ friends });
    });
});

export default router;
