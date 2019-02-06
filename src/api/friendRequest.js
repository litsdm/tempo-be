import { Router } from 'express';

import FriendRequest from '../models/friendRequest';
import User from '../models/user';

const router = Router();

router.post('/friendRequest', ({ body: { tag, from, queryProperty } }, res) => {
  const property = queryProperty || 'tag';
  User.findOne({ [property]: tag }, (err, user) => {
    if (!user || err) return res.status(401).send({ message: 'Hm, didn\'t work. Double check that the capitalization, spelling, any spaces, and numbers are correct.' });
    if (isInArray(from, user.friends)) return res.status(200).send({ message: `${user.username} is already your friend!` });

    const friendRequest = new FriendRequest({ from, to: user._id });
    friendRequest.save((error) => {
      if (error) return res.status(400).send({ message: 'Hm, didn\'t work. We were unable to send your request, please try again later.' });

      res.status(200).send({ friendRequest });
    })
  });
});

router.get('/friendRequest/:user_id', ({ params: { user_id } }, res) => {
  FriendRequest.find({ to: user_id })
    .populate('from', '_id username placeholderColor')
    .exec((err, friendRequests) => {
      if (err) return res.status(400).send({ message: err.message });

      res.status(200).send({ friendRequests });
    });
});

router.delete('/friendRequest/:request_id/accept', ({ params: { request_id } }, res) => {
  FriendRequest.findById(request_id).exec((err, friendRequest) => {
    if (!friendRequest) return res.status(404).send({ message: 'Friend Request not found.' })
    addFriendToUser(friendRequest.to, friendRequest.from, (err) => {
      if (err) return res.status(400).send({ message: err.message });
      addFriendToUser(friendRequest.from, friendRequest.to, (error) => {
        if (error) return res.status(400).send({ message: err.message });

        friendRequest.remove();
        res.status(200).send();
      });
    });
  });
});

router.delete('/friendRequest/:request_id/reject', ({ params: { request_id } }, res) => {
  FriendRequest.findOneAndDelete({ _id: request_id }, (err) => {
    if (err) return res.status(400).send({ message: err.message });
    res.status(200).send();
  });
});

const addFriendToUser = (userId, friendId, cb) => {
  User.findOneAndUpdate({ _id: userId }, { $push: { friends: friendId } })
    .exec((err) => {
      cb(err);
    });
}

const isInArray = (checkId, array) => array.some(friend => friend.equals(checkId));

export default router;
