import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionFilter } from './shared/filters';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    rawBody: true,
  });

  const port = process.env.PORT || 8080;

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));

  setupSwagger(app);
  await app.listen(port);
}
bootstrap();
