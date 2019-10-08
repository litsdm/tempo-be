import FriendRequest from '../../../../models/friendRequest';
import User from '../../../../models/user';

const addFriendToUser = (userId, friendId) => new Promise((resolve, reject) => {
  User.findOneAndUpdate({ _id: userId }, { $push: { friends: friendId } })
    .exec((error) => {
      if (error) reject(error);
      resolve();
    });
});

const findFriendRequest = (requestId) => new Promise((resolve, reject) => {
  FriendRequest.findById(requestId).exec((error, friendRequest) => {
    if (error) reject(error);
    if (!friendRequest) reject(new Error('Friend Request not found.'));
    resolve(friendRequest);
  });
});

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.requestId) throw new Error('options.params.requestId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch(exception) {
    throw new Error(`[acceptFriendRequest.validateOptions] ${exception.message}`);
  }
}

const acceptFriendRequest = async ({ params }, response) => {
  try {
    const { requestId } = params;
    validateOptions({ params, response });

    const friendRequest = await findFriendRequest(requestId);
    await addFriendToUser(friendRequest.to, friendRequest.from);
    await addFriendToUser(friendRequest.from, friendRequest.to);

    friendRequest.remove();

    response.status(200).send();
  } catch(exception) {
    response.status(500).send({ message: exception.message });
    throw new Error(`[acceptFriendRequest] ${exception.message}`)
  }
}

export default acceptFriendRequest;
