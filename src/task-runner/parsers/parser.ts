/**
 * This parser does naff all except return an optional `defaultValue`
 * when the input is `null` or `undefined`. It is here to merely to
 * act as a base Parser for all other parsers
 */
export class Parser<T> {
  async parse(input: any, config: ParserConfig<T>): Promise<T|null> {
    if (typeof input === 'undefined' || input === null) {
      if (typeof config.defaultValue === 'undefined' || config.defaultValue === null) {
        return null;
      } else {
        return config.defaultValue;
      }
    } else {
      return input as T;
    }
  }
}

export interface ParserConfig<T> {
  defaultValue?: T;
}