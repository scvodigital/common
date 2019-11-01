import { Parser, ParserConfig } from './parser';

const JSON6: any = require('json-6');

export class JsonParser extends Parser<any> {
  async parse(input: any, config: ParserConfig<any>): Promise<any> {
    try {
      if (typeof input === 'string') {
        return JSON6.parse(input);
      } else {
        return input;
      }
    } catch(err) {
      if (config.hasOwnProperty('defaultValue')) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}