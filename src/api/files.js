import { Router } from 'express';

// import User from '../models/user';
import File from '../models/file';
import User from '../models/user';

const router = Router();

router.post('/files', ({ body }, res) => {
  const file = new File(body);
  file.save((err) => {
    if (err) return res.status(401).send({ message: err.message });
    res.status(200).send({ file });
  });
});

router.get('/:userId/files', ({ params: { userId } }, res) => {
  File.find({ to: userId }, {}, { sort: { createdAt: -1 } }, (err, files) => {
    if (err) return res.status(401).send({ message: 'An error ocurred.' });
    res.send({ files });
  });
});

router.get('/admin/:userId/files', ({ params: { userId } }, res) => {
  User.findOne({ _id: userId }, 'role', (err, user) => {
    if (!user || err || user.role !== 'admin') res.send({ hasAccess: false }).end();

    File.find({}, {}, { sort: { createdAt: -1 } })
    .populate('from', '_id username email placeholderColor profilePic tag')
    .populate('to', '_id username email placeholderColor profilePic tag')
    .exec((error, files) => {
      if (error) res.send({ hasAccess: false }).end();

      res.status(200).send({ files, hasAccess: true }).end();
    });
  });
});

router.delete('/:userId/files/:fileId', ({ params: { userId, fileId } }, res) => {
  File.findOneAndUpdate({ $and: [ { to: userId, _id: fileId} ] }, { $pull: { to: userId } }, (err, fileBeforeUpdate) => {
    if (err) return res.status(400).send({ message: err.message });
    if (!fileBeforeUpdate) return res.status(200).send({ message: 'File has been deleted already.' });

    if (fileBeforeUpdate.to.length === 1) {
      File.findOneAndDelete({ _id: fileId }, (error) => {
        if (error) return res.status(400).send({ message: error.message });
        res.status(200).send({ shouldDeleteS3: true });
      });
    } else {
      res.send({ shouldDeleteS3: false });
    }
  });
});

export default router;
