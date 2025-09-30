import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    SupabaseStrategy,
    JwtAuthGuard,
    SupabaseAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, SupabaseAuthGuard],
})
export class AuthModule {}