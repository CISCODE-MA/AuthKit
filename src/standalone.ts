import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AuthKitModule } from './auth-kit.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthKitModule);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log('AuthKit listening on', port);
}

bootstrap();
