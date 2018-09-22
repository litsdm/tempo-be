import { Router } from 'express';

import User from '../models/user';
import File from '../models/file';

const router = Router();

router.post('/:userId/files', ({ body, params: { userId } }, res) => {
  const file = new File(body);
  file.save(() => {
    User.findById(userId).exec((err, user) => {
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
  .populate({ path: 'files', options: { sort: { createdAt: -1 } } })
  .exec((err, { files }) => {
    if (err) return res.status(401).send({ message: 'An error ocurred.' });
    res.send({ files });
  })
});

router.delete('/:userId/files/:fileId', ({ params: { userId, fileId } }, res) => {
  User.findByIdAndUpdate(userId, { $pull: { files: fileId } }, (err) => {
    if (err) return res.status(401).send({ message: 'An error ocurred.' });
    File.findOneAndDelete({ _id: fileId }, (err) => {
      if (err) console.log(err);
      res.status(200);
    });
  });
});

export default router;
