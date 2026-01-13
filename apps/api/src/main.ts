import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppLogger } from './infrastructure/logging/logger.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new AppLogger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  app.use(cookieParser());

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
