import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { requestRouter } from './request.routes';
import { statsRouter } from './stats.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/requests', requestRouter);
apiRouter.use('/stats', statsRouter);

