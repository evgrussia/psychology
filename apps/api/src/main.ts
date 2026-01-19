import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppLogger } from './infrastructure/logging/logger.service';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { requestContextMiddleware } from './infrastructure/observability/request-context.middleware';
import { ErrorRateMonitor } from './infrastructure/observability/error-rate-monitor.service';
import { ObservabilityExceptionFilter } from './infrastructure/observability/observability-exception.filter';
import { IErrorReporter } from './domain/observability/services/IErrorReporter';

async function bootstrap() {
  const logger = new AppLogger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger,
    bodyParser: false,
  });
  Logger.overrideLogger(logger);

  const httpAdapterHost = app.get(HttpAdapterHost);
  const errorReporter = app.get<IErrorReporter>('IErrorReporter');
  app.useGlobalFilters(new ObservabilityExceptionFilter(httpAdapterHost, errorReporter));

  process.on('unhandledRejection', (reason) => {
    errorReporter.captureException(reason, { source: 'unhandledRejection' });
  });
  process.on('uncaughtException', (error) => {
    errorReporter.captureException(error, { source: 'uncaughtException' });
  });

  app.use(
    bodyParser.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(requestContextMiddleware);
  const errorRateMonitor = app.get(ErrorRateMonitor);
  app.use((_req, res, next) => {
    res.on('finish', () => errorRateMonitor.recordStatus(res.statusCode));
    next();
  });

  const configService = app.get(ConfigService);
  const storagePath = configService.get<string>('MEDIA_STORAGE_PATH');
  if (storagePath) {
    app.useStaticAssets(storagePath, {
      prefix: '/media',
    });
    logger.log(`Serving static files from ${storagePath} at /media`);
  }

  app.use(cookieParser());

  app.enableCors({
    origin: true, // For development, allow all origins
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Psychology Platform API')
    .setDescription('The Psychology Platform API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available on: http://localhost:${port}/api/docs`);
}
bootstrap();
