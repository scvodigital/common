import * as Querystring from 'querystring';

import { Parser, ParserConfig } from './parser';

export class QuerystringParser extends Parser<any> {
  async parse(input: any, config: QuerystringParserConfig): Promise<any> {
    try {
      const querystring = input.startsWith('?') ? input.substr(1) : input;
      return Querystring.parse(querystring, config.separator || '&', config.equals || '=')
    } catch(err) {
      if (config.defaultValue) {
        return config.defaultValue;
      } else {
        throw err;
      }
    }
  }
}

export interface QuerystringParserConfig extends ParserConfig<any> {
  separator?: string;
  equals?: string;
}