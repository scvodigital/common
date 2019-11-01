export class Exception extends Error {
  timestamp = +new Date();
  name = 'Exception';

  constructor(message: string, public innerException?: Error) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Exception);
    }
  }

  toString(indent: string = '    '): string {
    const lines = [
      this.stack,
      `Timestamp: ${this.timestamp}`
    ];

    if (this.innerException) {
      lines.push('Inner Exception:');
      const innerException = (this.innerException.toString as any)(indent + '    ');
      const innerExceptionLines = innerException.split(/\r?\n/g);
      for (const line of innerExceptionLines) {
        lines.push(indent + line);
      }
      lines.push();
    }

    return lines.join('\n');
  }
}