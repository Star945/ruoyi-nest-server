import { Injectable, NestMiddleware } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { pick, omit } from 'lodash';

const myFormat = winston.format.printf(
  ({ level, message, meta, timestamp }) => {
    const _meta = meta
      ? JSON.stringify(
          omit(meta, [
            // 'req.headers.jwt',
            'req.headers.cookie',
            'req.method',
            'req.httpVersion',
            'req.url',
          ]),
          null,
          4,
        )
      : '';
    return `${timestamp} ${level}: ${message} ${_meta}`;
  },
);

const loggerFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  myFormat,
);

const logPath = `${__dirname}/../../logs`;

export const logger = winston.createLogger({
  format: loggerFormat,
  transports: [
    new winston.transports.DailyRotateFile({
      filename: `${logPath}/app.%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '100m',
      maxFiles: '7d',
      level: 'info',
    }),
    new winston.transports.DailyRotateFile({
      filename: `${logPath}/errors.%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '100m',
      maxFiles: '14d',
      level: 'error',
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: `${logPath}/exceptions.log` }),
  ],
});

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    next();
  }
}
