import { Router } from 'express';

import sendLink from '../actions/email/sendLink';

const router = Router();

router.post('/email', sendLink);

export default router;
