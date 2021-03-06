import * as Crypto from 'crypto';

const JSON6: any = require('json-6');
import * as $ from 'jquery';
import { ComponentManager } from '../component-manager';
import { Exception } from '../exception';

export class BaseComponent<T> {
  config: T;
  uid: string = Crypto.randomBytes(8).toString('hex');
  element: JQuery<HTMLElement>;

  get componentType(): string {
    return this.constructor.name;
  }

  constructor(element: Element|JQuery<HTMLElement>, public componentManager: ComponentManager) {
    this.element = $(element) as JQuery<HTMLElement>;
    let unparsedConfig = this.element.attr('data-' + this.componentType.toLowerCase()) || '';
    if (!unparsedConfig.startsWith('{') || !unparsedConfig.endsWith('}')) {
      unparsedConfig = $(`script[data-component-config="${unparsedConfig}"]`).html();
    }
    try {
      this.config = JSON6.parse(unparsedConfig);
    } catch (err) {
      console.error(this.componentType + ' => invalid configuration JSON', err, unparsedConfig);
      throw new Exception(this.componentType + ' => invalid configuration JSON', err);
    }
    if (typeof this.config !== 'object') {
      console.error(this.componentType + ' => Invalid configuration JSON', this.config);
    }
    this.element.data(this.componentType + '-uid', this.uid);
  }

  async init() { return; }

  async destroy() { return; }
}