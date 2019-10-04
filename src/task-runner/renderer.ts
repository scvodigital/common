import { ParserConfig, Parser } from './parsers/parser';
import { TaskRunnerContext } from './task-runner';
import { BristlesHelpers } from './bristles-helpers';

import { BooleanParser } from './parsers/boolean-parser';
import { FloatParser } from './parsers/float-parser';
import { IntegerParser } from './parsers/integer-parser';
import { JsonParser } from './parsers/json-parser';
import { StringParser } from './parsers/string-parser';
import { UrlParser } from './parsers/url-parser';
import { QuerystringParser } from './parsers/querystring-parser';

import { Bristles } from 'bristles';

export class Renderer {
  parsers: { [parserName: string]: Parser<any> } = {
    boolean: new BooleanParser(),
    float: new FloatParser(),
    integer: new IntegerParser(),
    json: new JsonParser(),
    string: new StringParser(),
    url: new UrlParser(),
    querystring: new QuerystringParser(),
    basic: new Parser()
  };

  constructor() {
    this.registerHelpers();
    this.registerPartials();
  }

  registerHelpers() {
    try {
      const propertyNames = Object.getOwnPropertyNames(BristlesHelpers);
      for (const prop of propertyNames) {
        if (prop.startsWith('_') && typeof (BristlesHelpers as any)[prop] === 'function') {
          const name = prop.substr(1);
          Bristles.registerHelper(name, (BristlesHelpers as any)[prop]);
          Bristles.registerHelper(prop, () => { return (BristlesHelpers as any)[prop]; });
        }
      }
    } catch (err) {
      console.error('Failed to register Bristles Helpers', err);
    }
  }

  registerPartials() {
    try {
      const partialElements = $('script[data-partial]');
      partialElements.each((index, element) => {
        const name = $(element).data('partial');
        const template = $(element).html();
        Bristles.registerPartial(name, template);
      });
    } catch (err) {
      console.error('Failed to register Bristles Partials', err);
    }
  }

  async render(config: RenderConfig, context: TaskRunnerContext): Promise<any> {
    const template = await this.getTemplate(config, context);
    const rendered = await Bristles.compile(template)(context);
    const parsed = await this.parseRendered(rendered, config);
    return parsed;
  }

  async getTemplate(config: RenderConfig, context: TaskRunnerContext): Promise<any> {
    return config.__template;
  }

  async parseRendered(rendered: any, config: RenderConfig): Promise<any> {
    if (config.__parser) {
      const parser = this.parsers.hasOwnProperty(config.__parser) ? this.parsers[config.__parser] : this.parsers.basic;
      const parsed = await parser.parse(rendered, config.__parserConfig || {});
      return parsed;
    } else {
      return rendered;
    }
  }

  async core(template: any, context: TaskRunnerContext): Promise<any> {
    return template;
  }
}

export interface RenderConfig {
  __template: any;
  __parser?: string;
  __parserConfig?: ParserConfig<any>;
  __metaData?: any;
}