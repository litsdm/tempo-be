import { Router } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/user';
import File from '../models/file';

const router = Router();

router.post('/:userId/files', ({ body, params: { userId } }, res) => {
  const file = new File(body);
  file.save(() => {
    User.findById(userId).exec((err, user) => {
      console.log(err);
      if (err) return res.status(401).send({ message: 'An error ocurred.' });
      user.files.push(file);
      user.save();
      res.status(200).send({ file });
    });
  });
});

router.get('/:userId/files', ({ params: { userId } }, res) => {
  User.findById(userId)
  .select('files')
  .populate('files')
  .exec((err, { files }) => {
    if (err) return res.status(401).send({ message: 'An error ocurred.' });
    res.send({ files });
  })
});

export default router;
