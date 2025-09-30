import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  if (configService.get('HELMET_ENABLED', 'true') === 'true') {
    app.use(helmet());
  }

  // Compression
  app.use(compression());

  // CORS
  const corsOrigins = configService.get('CORS_ORIGINS', 'http://localhost:3000').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  if (configService.get('ENABLE_SWAGGER', 'true') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('CORIA Backend API')
      .setDescription('Vegan Lifestyle App - Solana Wallet & Premium System')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('wallets', 'Solana wallet management')
      .addTag('payments', 'Payment processing')
      .addTag('premium', 'Premium subscription management')
      .addTag('webhooks', 'Webhook handlers')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Start server
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 CORIA Backend is running on: http://localhost:${port}/${apiPrefix}`);
  if (configService.get('ENABLE_SWAGGER', 'true') === 'true') {
    console.log(`📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
  }
  console.log(`🌱 Solana Network: ${configService.get('SOLANA_NETWORK', 'devnet')}`);
  console.log(`💰 Premium Price: ${configService.get('PREMIUM_PRICE_SOL', '1.0')} SOL`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start CORIA Backend:', error);
  process.exit(1);
});