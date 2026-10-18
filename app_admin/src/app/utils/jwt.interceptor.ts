import {
  HttpInterceptorFn
} from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn =
  (request, next) => {

    const isAuthAPI =
      request.url.endsWith('/login') ||
      request.url.endsWith('/register');

    const token =
      localStorage.getItem('travlr-token');

    if (token && !isAuthAPI) {
      try {
        const payload =
          JSON.parse(atob(token.split('.')[1]));

        if (payload.exp > (Date.now() / 1000)) {

          const authRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });

          return next(authRequest);
        }
      } catch {
        localStorage.removeItem('travlr-token');
      }
    }

    return next(request);
  };
