import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { SupabaseService } from '@/common/services/supabase.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  async validate(req: any): Promise<any> {
    const token = this.extractTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const user = await this.supabaseService.getUserFromToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      ...user,
      access_token: token,
    };
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}