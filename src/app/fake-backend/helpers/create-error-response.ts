import {
    HttpErrorResponse,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

export function createErrorResponse(req: HttpRequest<any>) {
    return of(null).pipe(
        delay(300),
        switchMap(() =>
            throwError(
                () =>
                    new HttpErrorResponse({
                        error: 'No se ha podido contactar con el servidor',
                        status: HttpStatusCode.InternalServerError,
                        statusText: 'Internal Server Error',
                        url: req.url,
                    })
            )
        )
    );
}