import { Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('NestBootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api/v1/'); 
  
  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription('The Authentication API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document);

  //enable.cors
  app.enableCors();

  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter)); // order matters

  await app.listen(process.env.PORT);
  logger.log(`Listen on port ${process.env.PORT}`)
}
bootstrap();
