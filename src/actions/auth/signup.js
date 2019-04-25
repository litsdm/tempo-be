import User from '../../models/user';

import { generateToken } from './login';

const saveUser = (userData) => new Promise((resolve, reject) => {
  const user = new User(userData);
  user.save((error) => {
    if (error) reject(error);
    resolve(user);
  });
})

const checkForExistingUser = (email) => new Promise((resolve, reject) => {
  User.findOne({ email }, (error, user) => {
    if (error) reject(error)
    if (user) reject(new Error('Email already in use.'));
    resolve(user);
  })
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.email) throw new Error('options.body.email is required.');
    if (!options.body.password) throw new Error('options.body.password is required.');
    if (!options.body.username) throw new Error('options.body.username is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[signup.validateOptions] ${exception.message}`);
  }
}

const signup = async ({ body }, response) => {
  try {
    const { email } = body;
    validateOptions({ body, response });

    await checkForExistingUser(email);
    const user = await saveUser(body);
    const token = generateToken(user);

    response.status(200).send({ token });
  } catch(exception) {
    response.status(401).send({ message: exception.message });
    throw new Error(`[signup] ${exception.message}`);
  }
}

export default signup;
