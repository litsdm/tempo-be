import { Router } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/user';

const router = Router();

router.post('/login', ({ body: { email, password } }, res) => {
  User.findOne({ email }, (err, user) => {
    if (!user) return res.status(401).send({ message: 'There is no user with that email.' });
    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) return res.status(401).send({ message: 'Password is incorrect.' });
      const { _id, username, email, placeholderColor, discriminator, profilePic } = user;
      const token = jwt.sign({ id: _id, username, email, placeholderColor, discriminator, profilePic }, process.env.JWT_SECRET);
      res.send({ token });
    })
  });
});

router.post('/sign-up', ({ body }, res) => {
  User.findOne({ email: body.email }, (err, user) => {
    const newUser = new User(body);

    if (user) return res.status(401).send({ message: 'Email already in use.' });

    newUser.save((err) => {
      if (err) { return res.status(400).send({ message: err }) }
      const { _id, username, email, placeholderColor, discriminator, profilePic } = newUser;
      const token = jwt.sign({ id: _id, username, email, placeholderColor, discriminator, profilePic }, process.env.JWT_SECRET);
      res.send({ token });
    });
  });
});

export default router;
