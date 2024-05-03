import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './shared/filters';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    rawBody: true,
  });

  const port = process.env.PORT || 8080;

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));
  await app.listen(port);
}
bootstrap();
