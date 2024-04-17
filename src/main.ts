import { NestFactory, Reflector } from '@nestjs/core';
import compression from '@fastify/compress';
import { fastifyRequestContext } from '@fastify/request-context';
import helmet from '@fastify/helmet';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { useContainer } from 'class-validator';
import {
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
  LogLevel,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './shared/common/filter';
import {
  fastifyRequestIdHookHandler,
  REQUEST_ID_HEADER_KEY,
  WinstonLogger,
} from './shared/logging';
import { AppModule } from './app.module';

/**
 * Default port number.
 */
const DEFAULT_PORT = 4000;

/**
 * Default base url endpoint for api.
 */
const DEFAULT_API_PREFIX = '/api';

/**
 * Default api version.
 */
const DEFAULT_API_VERSION = '1';

/**
 * Default url endpoint for Swagger UI.
 */
const DEFAULT_SWAGGER_PREFIX = '/docs';

/**
 * Default bootstrap log level.
 */
const DEFAULT_BOOTSTRAP_LOG_LEVEL = 'error';

/**
 * Setup the Swagger (UI).
 *
 * @param app
 */

export const setupSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('Audease MVP Backend API')
    .setDescription('Backend API for Audease MVP written in NestJS')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  const path = process.env.SWAGGER_PREFIX || DEFAULT_SWAGGER_PREFIX;

  SwaggerModule.setup(path, app, document);
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const fastifyAdapter = new FastifyAdapter({
    ignoreTrailingSlash: true,
    requestIdHeader: REQUEST_ID_HEADER_KEY,
  });

  const fastifyInstance = fastifyAdapter.getInstance();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      logger: [
        (process.env.LOG_LEVEL || DEFAULT_BOOTSTRAP_LOG_LEVEL) as LogLevel,
      ],
      abortOnError: false,
    },
  );

  app.useLogger(app.get(WinstonLogger));
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: process.env.API_VERSION || DEFAULT_API_VERSION,
  });

  app.setGlobalPrefix(process.env.PREFIX || DEFAULT_API_PREFIX);

  setupSwagger(app);

  app.register(fastifyRequestContext);
  fastifyInstance.addHook('onRequest', fastifyRequestIdHookHandler);

  app.register(compression);
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get<Reflector>(Reflector)),
  );

  await app.listen(process.env.PORT || DEFAULT_PORT, '0.0.0.0');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
