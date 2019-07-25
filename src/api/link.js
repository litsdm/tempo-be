import { Router } from 'express';

import createLink from '../actions/link/createLink';
import getLink from '../actions/link/getLink';
import deleteLink from '../actions/link/deleteLink';

const router = Router();

router.post('/links', createLink);
router.get('/links/:linkId', getLink);
router.delete('/links/:linkId', deleteLink);

export default router;
