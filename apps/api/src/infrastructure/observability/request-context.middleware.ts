import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestContext } from './request-context';

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const headerRequestId = req.headers['x-request-id'];
  const requestId = typeof headerRequestId === 'string' && headerRequestId.trim()
    ? headerRequestId.trim()
    : randomUUID();

  res.setHeader('x-request-id', requestId);
  (req as Request & { requestId?: string }).requestId = requestId;

  RequestContext.run(
    {
      requestId,
      method: req.method,
      path: req.path,
    },
    () => next(),
  );
};
