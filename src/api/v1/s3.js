import { Router } from 'express';

import signS3Put from './actions/s3/signPut';
import signS3Get from './actions/s3/signGet';
import deleteS3 from './actions/s3/delete';

const router = Router();

router.get('/sign-s3', signS3Put);
router.get('/get-s3', signS3Get);
router.post('/delete-s3', deleteS3);

export default router;
