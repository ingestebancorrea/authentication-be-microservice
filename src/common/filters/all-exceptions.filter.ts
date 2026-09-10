import { HttpService } from '@nestjs/axios';
import { ExceptionFilter,Catch,ArgumentsHost,HttpException,HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { ErrorMessages } from '../enum/error-messages.enum';

  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  
    async catch(exception: Error, host: ArgumentsHost): Promise<any> {
      // In certain situations `httpAdapter` might not be available in the
      // constructor method, thus we should resolve it here.
      const { httpAdapter } = this.httpAdapterHost;
  
      const ctx = host.switchToHttp();
  
      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      
      let requestException = {} ////captura todas las excepciones
      let httpMessage = ErrorMessages.INTERNAL_SERVER_ERROR

      if(exception instanceof HttpException){
        const reqException = exception.getResponse()
        httpMessage = reqException["error"]
        requestException = reqException["message"]
      }

      //Hacer seguimiento al error para conocer el path_file y line
      // const parse =  (await import('stack-trace')).parse;
      // const trace = parse(exception);

      //Consumir servicio para registrar el error en base de datos.
      const httpService = new HttpService();

      // if(typeof process.env.ALLOW_LOG_REGISTER !== undefined){
      //   if(process.env.ALLOW_LOG_REGISTER==='true'){
      //     firstValueFrom(httpService.post(process.env.ERROR_ENDPOINT, {
      //       "status_code": httpStatus,
      //       "error_message": requestException,
      //       "file_path": trace[0].getFileName(),
      //       "line": trace[0].getLineNumber(),
      //       "endpoint": httpAdapter.getRequestUrl(ctx.getRequest()),
      //       "error_date": new Date,
      //       "application_name": "enlazaa-test-factory"
      //     }));
      //   }
      // }
      
      const responseBody = {
        statusCode: httpStatus,
        // timestamp: new Date().toISOString(),
        // path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: requestException,
        error: httpMessage,
        // method:ctx.getRequest().method
      };
  
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
  