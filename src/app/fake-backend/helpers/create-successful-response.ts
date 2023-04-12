import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export function createSuccesfulResponse<T>(
  results: T,
  statusCode = HttpStatusCode.Ok
) {
  return of(
    new HttpResponse<T>({
      body: results,
      status: statusCode,
      statusText: 'Ok',
    })
  ).pipe(delay(300));
}