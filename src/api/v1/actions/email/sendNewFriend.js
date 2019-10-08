import path from 'path';
import Email from 'email-templates';

import { generateTransport } from './sendLink';

const { EMAIL_USER } = process.env;

const validateOptions = options => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.to) throw new Error('options.body.to is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[sendNewFriend.validateOptions] ${exception.message}`);
  }
};

const sendNewFriend = async ({ body }, response) => {
  try {
    const { to } = body;
    validateOptions({ body, response });

    const transport = await generateTransport();

    const mailOptions = {
      template: path.join(__dirname, '../../emails/newFriend'),
      message: { to: to.join(',') }
    };

    const email = new Email({ message: { from: EMAIL_USER }, transport, send: true });
    await email.send(mailOptions);

    response.status(200).send();
  } catch(exception) {
    response.status(500).send();
    throw new Error(`[sendNewFriend] ${exception.message}`);
  }
};

export default sendNewFriend;
