// src/shared/middleware/subdomain.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthRepository } from '../../auth/auth.repository';

export interface SubdomainRequest extends Request {
  subdomain?: string;
  school?: any;
  isBaseDomain?: boolean;
}

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(private readonly authRepository: AuthRepository) {}

  async use(req: SubdomainRequest, res: Response, next: NextFunction) {
    const host = req.get('host') || '';
    const baseDomain = process.env.BASE_DOMAIN || 'audease.com';

    // Check if it's the base domain (audease.com or www.audease.com)
    if (host === baseDomain || host === `www.${baseDomain}`) {
      req.isBaseDomain = true;
      req.subdomain = null;
      req.school = null;
    }
    // Extract subdomain for school-specific domains
    else if (host.includes(baseDomain)) {
      const subdomain = host.replace(`.${baseDomain}`, '');

      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        req.subdomain = subdomain;
        req.isBaseDomain = false;

        // Find school by subdomain
        try {
          const school =
            await this.authRepository.findSchoolBySubdomain(subdomain);
          if (school && school.domain_verified) {
            req.school = school;
          } else {
            // Invalid or unverified subdomain
            return res.status(404).json({
              error: 'School not found',
              message:
                'The requested school domain does not exist or is not verified',
              code: 'SCHOOL_NOT_FOUND',
            });
          }
        } catch (error) {
          return res.status(500).json({
            error: 'Internal server error',
            message: 'Unable to verify school domain',
          });
        }
      }
    }

    next();
  }
}
