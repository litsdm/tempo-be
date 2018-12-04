import { Router } from 'express';

import User from '../models/user';
import File from '../models/file';

const router = Router();

router.post('/files', ({ body }, res) => {
  const file = new File(body);
  file.save(() => {
    User.updateMany({ _id: { $in: file.to } }, { $push: { files: file._id } })
      .exec((err, users) => {
        console.log(err, users);
        if (err) return res.status(401).send({ message: err.message });
        res.status(200).send({ file });
      });
  });
});

router.get('/:userId/files', ({ params: { userId } }, res) => {
  File.find({ to: userId }, {}, { sort: { createdAt: -1 } }, (err, files) => {
    if (err) return res.status(401).send({ message: 'An error ocurred.' });
    res.send({ files });
  });
});

router.delete('/:userId/files/:fileId', ({ params: { userId, fileId } }, res) => {
  User.findOneAndUpdate({ _id: userId }, { $pull: { files: fileId } }, (err) => {
    if (err) return res.status(401).send({ message: 'An error ocurred.' });
    File.findOneAndDelete({ _id: fileId }, (err) => {
      if (err) console.log(err);
      res.status(200);
    });
  });
});

export default router;
