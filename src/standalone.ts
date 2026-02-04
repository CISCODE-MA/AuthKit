import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthKitModule, SeedService } from './index';

// Standalone app module with MongoDB connection and auto-seed
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth_kit_test'),
    AuthKitModule,
  ],
})
class StandaloneAuthApp implements OnModuleInit {
  constructor(private readonly seed: SeedService) {}
  
  async onModuleInit() {
    // Auto-seed defaults on startup
    await this.seed.seedDefaults();
  }
}

async function bootstrap() {
  const app = await NestFactory.create(StandaloneAuthApp);
  
  // Enable CORS for frontend testing
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ AuthKit Backend running on http://localhost:${port}`);
  console.log(`📝 API Base: http://localhost:${port}/api/auth`);
  console.log(`💾 MongoDB: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth_kit_test'}`);
}

bootstrap().catch(err => {
  console.error('❌ Failed to start backend:', err);
  process.exit(1);
});
