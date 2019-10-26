import { Router } from 'express';

import updateUser from './actions/user/updateUser';
import getUserFriends from './actions/user/getUserFriends';
import getLinks from './actions/user/getLinks';
import getRecentlySent from './actions/user/getRecentlySent';
import putRecentlySent from './actions/user/putRecentlySent';

const router = Router();

router.put('/:userId/update', updateUser);
router.get('/:userId/friends', getUserFriends);
router.get('/:userID/links', getLinks);
router.get('/:userID/recentlySent', getRecentlySent);
router.put('/:userID/recentlySent', putRecentlySent);

export default router;
