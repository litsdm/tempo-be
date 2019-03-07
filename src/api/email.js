import path from 'path';
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import { Router } from 'express';

const { EMAIL_USER, EMAIL_PASS } = process.env;

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const router = Router();

router.post('/email', ({ body: { to, endpoint, from } }, res) => {
  const email = new Email({
    message: {
      from: EMAIL_USER
    },
    transport
  });

  email.send({
    template: path.join(__dirname, '../emails/link'),
    message: {
      to: to.join(' ')
    },
    locals: {
      url: `https://www.feathershare.com/${endpoint}`,
      from
    }
  })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.log(err);
      res.status(400).send({ err })
    });
});

export default router;
