import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        return this.stripSensitiveFields(data);
      })
    );
  }

  private stripSensitiveFields(data: any): any {
    if (data) {
      delete data.id;
      return data;
    }
  }
}
