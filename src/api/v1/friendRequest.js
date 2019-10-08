import { Router } from 'express';

import createFriendRequest from './actions/friendRequest/createFriendRequest';
import getFriendRequests from './actions/friendRequest/getFriendRequests';
import acceptFriendRequest from './actions/friendRequest/acceptFriendRequest';
import rejectFriendRequest from './actions/friendRequest/rejectFriendRequest';

const router = Router();

router.post('/friendRequest', createFriendRequest);
router.get('/friendRequest/:userId', getFriendRequests);
router.delete('/friendRequest/:requestId/accept', acceptFriendRequest);
router.delete('/friendRequest/:requestId/reject', rejectFriendRequest);

export default router;
