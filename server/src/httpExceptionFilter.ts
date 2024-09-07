import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

interface HttpExceptionResponse {
  statusCode: number;
  message: string;
  error: string;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  // ArgumentsHost => we use it to obtain a reference to the Request and Response objects that are being passed to the original request handler (in the controller where the exception originates).
  // In this code sample, we've used some helper methods on ArgumentsHost to get the desired Request and Response objects
  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.log('Exception :: ==> ', exception);

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : String(exception);

    const responseBody = {
      statuCode: httpStatus,
      timeStamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message:
        (exceptionResponse as HttpExceptionResponse).error ||
        (exceptionResponse as HttpExceptionResponse).message ||
        exceptionResponse ||
        'something went wrong',
      errorResponse: exceptionResponse as HttpExceptionResponse,
      stack: process.env.NODE_ENV === 'development' ? exception.stack : null,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
