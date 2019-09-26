export class BristlesHelpers {
  static _jquery(selector: string, method: string, args: string[], property: string): any {
    try {
      if (typeof selector !== 'string') {
        throw Error('No selector specified');
      }

      const helper: HelperOptions = arguments[arguments.length - 1];
      const context = $(helper.hash.context || document);
      const element = context.find(selector) as any;

      if (typeof method !== 'string') {
        return element;
      }

      if (typeof element[method] !== 'function') {
        throw Error(`Invalid method '${method}'`);
      }

      const returnVal: any = (element[method] as Function).apply(element, Array.isArray(args) ? args : []);

      if (typeof property !== 'string') {
        return returnVal;
      }

      if (!returnVal.hasOwnProperty(property)) {
        throw Error(`Invalid property '${property}' on response from '${method}'`);
      }

      return returnVal[property];
    } catch (err) {
      console.error('Bristles Error -> Helper: if, Error:', err.message);
      return null;
    }
  }

  static isOps(obj: any) {
    return !!obj &&
      obj.hasOwnProperty('hash') &&
      obj.hasOwnProperty('data') &&
      obj.hasOwnProperty('name');
  }
}

export interface HelperOptions {
    fn: TemplateDelegate;
    inverse: TemplateDelegate;
    hash: any;
    data?: any;
}

export interface TemplateDelegate<T = any> {
  (context: T, options?: RuntimeOptions): string;
}

export interface RuntimeOptions {
  partial?: boolean;
  depths?: any[];
  helpers?: { [name: string]: Function };
  partials?: { [name: string]: HandlebarsTemplateDelegate };
  decorators?: { [name: string]: Function };
  data?: any;
  blockParams?: any[];
}