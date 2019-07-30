import path from 'path';
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import { google } from 'googleapis';

const { OAuth2 } = google.auth;
const { GMAIL_CLIENT_ID, GMAIL_SECRET, REFRESH_TOKEN, EMAIL_USER } = process.env;

export const generateTransport = async () => {
  try {
    const client = new OAuth2(GMAIL_CLIENT_ID, GMAIL_SECRET, 'https://developers.google.com/oauthplayground');
    client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const accessToken = await client.getAccessToken();

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_USER,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken
      }
    });
  } catch(exception) {
    throw new Error(`[EmailActions.generateTransport] ${exception.message}`);
  }
}

const validateOptions = options => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.body.to) throw new Error('options.body.to is required.');
    if (!options.body.endpoint) throw new Error('options.body.endpoint is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[sendLink.validateOptions] ${exception.message}`);
  }
}

const sendLink = async ({ body }, response) => {
  try {
    const { to, endpoint, from } = body;
    validateOptions({ body, response });

    const transport = await generateTransport();

    const mailOptions = {
      template: path.join(__dirname, '../../emails/link'),
      message: { to: to.join(',') },
      locals: {
        url: `https://www.feathershare.com/${endpoint}`,
        from
      }
    };

    const email = new Email({ message: { from: EMAIL_USER }, transport, send: true });
    await email.send(mailOptions);

    response.status(200).send();
  } catch (exception) {
    response.status(500).send();
    throw new Error(`[sendLink] ${exception.message}`);
  }
}

export default sendLink;
