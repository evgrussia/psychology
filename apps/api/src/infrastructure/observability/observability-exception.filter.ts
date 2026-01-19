import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { IErrorReporter } from '@domain/observability/services/IErrorReporter';
import { RequestContext } from './request-context';

@Catch()
export class ObservabilityExceptionFilter extends BaseExceptionFilter {
  constructor(
    httpAdapterHost: HttpAdapterHost,
    private readonly errorReporter: IErrorReporter,
  ) {
    super(httpAdapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const statusCode = this.resolveStatusCode(exception);

    if (statusCode >= 500) {
      const requestId = RequestContext.getRequestId();
      const userId = (request as any)?.user?.id ?? null;
      const leadId = (request as any)?.lead?.id ?? null;

      this.errorReporter.captureException(exception, {
        requestId,
        method: request?.method ?? null,
        path: request?.url ?? null,
        statusCode,
        userId,
        leadId,
        source: 'http',
      });
    }

    return super.catch(exception, host);
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return 500;
  }
}
