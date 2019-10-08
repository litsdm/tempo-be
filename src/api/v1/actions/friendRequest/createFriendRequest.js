import FriendRequest from '../../../../models/friendRequest';
import User from '../../../../models/user';

const saveFriendRequest = (from, to) => new Promise((resolve, reject) => {
  const friendRequest = new FriendRequest({ from, to });
  friendRequest.save((error) => {
    if (error) reject(error);
    resolve(friendRequest);
  })
})

const findFriendRequest = (from, to) => new Promise((resolve, reject) => {
  FriendRequest.findOne({ from, to }, (error, friendRequest) => {
    if (error) reject(error);
    resolve(friendRequest);
  });
});

const isInArray = (checkId, array) => array.some(friend => friend.equals(checkId));

const findUser = (property, tag) => new Promise((resolve, reject) => {
  User.findOne({ [property]: tag }, (error, user) => {
    if (error) reject(error);
    if (!user) reject(new Error('Hm, didn\'t work. Double check that the capitalization, spelling, any spaces, and numbers are correct.'));
    resolve(user);
  });
});

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.tag) throw new Error('options.body.tag is required.');
    if (!options.body.from) throw new Error('options.body.from is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[createFriendRequest.validateOptions] ${exception.message}`);
  }
}

const createFriendRequest = async ({ body }, response) => {
  try {
    const { tag, from, queryProperty } = body;
    const property = queryProperty || 'tag';

    validateOptions({ body, response });

    const user = await findUser(property, tag);
    if (isInArray(from, user.friends)) return response.status(200).send({ message: `${user.username} is already your friend!` });

    const existingFriendRequest = await findFriendRequest(from, user._id);
    if (existingFriendRequest) return response.status(200).send({ message: 'Your request has already been sent!' });

    const friendRequest = await saveFriendRequest(from, user._id);

    response.status(200).send({ friendRequest });
  } catch(exception) {
    response.status(401).send({ message: exception.message });
    throw new Error(`[createFriendRequest] ${exception.message}`);
  }
}

export default createFriendRequest;
