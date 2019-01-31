import { Router } from 'express';

import Link from '../models/link';

const router = Router();

router.post('/links', ({ body }, res) => {
  const link = new Link(body);
  link.save((err) => {
    if (err) return res.status(401).send({ message: err.message });
    res.status(200).send({ link });
  });
});

router.get('/links/:linkId', ({ params: { linkId } }, res) => {
  Link.findOne({ _id: linkId }, (err, link) => {
    if (err) return res.status(401).send({ message: 'An error ocurred.' });
    res.send({ link });
  });
});

router.delete('/links/linkId', ({ params: { linkId } }, res) => {
  Link.findOneAndDelete({ _id: linkId }, (error) => {
    if (error) return res.status(400).send({ message: error.message });
    res.sendStatus(200);
  });
});

export default router;
