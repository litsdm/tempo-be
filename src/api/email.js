import { Router } from 'express';

import sendLink from '../actions/email/sendLink';
import sendNewFriend from '../actions/email/sendNewFriend';

const router = Router();

router.post('/email', sendLink);
router.post('/email/newFriend', sendNewFriend);

export default router;
