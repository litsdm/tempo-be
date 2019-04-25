import jwt from 'jsonwebtoken';

import User from '../../models/user';

export const generateToken = (user) => {
  const { _id, username, email, placeholderColor, discriminator, profilePic, isPro, remainingBytes, remainingFiles, role } = user;
  return jwt.sign({ id: _id, username, email, placeholderColor, discriminator, profilePic, isPro, remainingBytes, remainingFiles, role }, process.env.JWT_SECRET);
}

const comparePassword = (user, password) => new Promise((resolve, reject) => {
  user.comparePassword(password, (err, isMatch) => {
    if (!isMatch) reject(new Error('Password is incorrect.'));
    resolve();
  });
})

const findUser = (email) => new Promise((resolve, reject) => {
  User.findOne({ email }, (error, user) => {
    if (error) reject(error)
    if (!user) reject(new Error('There is no user with that email.'));
    resolve(user);
  })
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.email) throw new Error('options.body.email is required.');
    if (!options.body.password) throw new Error('options.body.password is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[login.validateOptions] ${exception.message}`);
  }
}

const login = async ({ body }, response) => {
  try {
    const { email, password } = body;
    validateOptions({ body, response });

    const user = await findUser(email);
    await comparePassword(user, password);
    const token = generateToken(user);

    response.status(200).send({ token });
  } catch(exception) {
    response.status(401).send({ message: exception.message });
    throw new Error(`[login] ${exception.message}`);
  }
}

export default login;
