import { TaskRunnerContext } from './task-runner';
import { Renderer } from './renderer';

export class ObjectCompiler {
  static renderer = new Renderer();

  static isTemplate(property: any): boolean {
    return typeof property === 'object' && property !== null && property.hasOwnProperty('__template');
  }

  static async compile(config: any, context: TaskRunnerContext, specialProperties?: string[]): Promise<any> {
    if (typeof config !== 'object') {
      return config;
    }

    //May not be necessary
    let output = JSON.parse(JSON.stringify(config));

    if (specialProperties) {
      for (const prop of specialProperties) {
        const property = ObjectCompiler.objectPath(output, prop);
        output[prop] = await ObjectCompiler.compileProperty(property, context);
      }
    } else {
      output = await ObjectCompiler.compileProperty(output, context);
    }

    return output;
  }

  static async compileProperty(property: any, context: TaskRunnerContext): Promise<any> {
    const resolvedProperty = ObjectCompiler.resolvePointer(property, context);

    if (ObjectCompiler.isTemplate(resolvedProperty)) {
      return await ObjectCompiler.renderer.render(resolvedProperty, context);
    }

    if (Array.isArray(resolvedProperty)) {
      const compiled = [];
      for (const item of resolvedProperty) {
        const resolved = await ObjectCompiler.compileProperty(item, context);
        compiled.push(resolved);
      }
      return compiled;
    }

    if (typeof resolvedProperty === 'object') {
      const output: any = {};
      for (const [key, value] of Object.entries(resolvedProperty)) {
        output[key] = await ObjectCompiler.compileProperty(value, context);
      }
      return output;
    }

    return resolvedProperty;
  }

  static resolvePointer(property: any, context: any) {
    if (!property || !property.hasOwnProperty('__pointer')) return property;

    const value = ObjectCompiler.objectPath(context, property.__pointer);
    if (typeof value === 'undefined') {
      throw new Error(`Could not resolve pointer "${property.__pointer}"`);
    }

    return value;
  }

  static objectPathCache: { [path: string]: Function } = {};
  static objectPath(obj: any, path: string) {
    if (!ObjectCompiler.objectPathCache.hasOwnProperty(path)) {
      //TODO: How could this be exploited? Do I need to do any sanitising of `path`?
      ObjectCompiler.objectPathCache[path] = new Function("obj", "return obj." + path + ";");
    }
    const resolved = ObjectCompiler.objectPathCache[path](obj);
    return resolved;
  }
}