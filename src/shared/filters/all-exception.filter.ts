import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Config } from '../../shared/constants/config.constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpException =
      exception instanceof HttpException
        ? exception
        : new InternalServerErrorException(exception, 'Unknown error');

    const responseBody = {
      status: httpException.getStatus(),
      name: httpException.name,
      error: httpException.message,
      stack: Config.dev ? (exception as Error).stack : '',
    };

    console.error(exception);

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      httpException.getStatus(),
    );
  }
}
