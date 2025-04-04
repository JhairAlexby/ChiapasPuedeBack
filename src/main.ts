import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();
  
  // Prefijo global para las rutas API
  app.setGlobalPrefix('api');
  
  // Puerto configurable
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  logger.log(`Chiapas Puede API running on port ${port}`);
}

bootstrap();