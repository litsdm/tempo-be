import { Router } from 'express';

import login from './actions/auth/login';
import signup from './actions/auth/signup';

const router = Router();

router.post('/login', login);
router.post('/sign-up', signup);

export default router;
