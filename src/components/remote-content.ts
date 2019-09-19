import { BaseComponent } from './base-component';

export class RemoteContent extends BaseComponent<RemoteContentConfig> {
  async init() {
    await this.load();
  }

  async load() {
    const contentResponse = await fetch(this.config.url);
    const content = await contentResponse.text();
    this.element.html(content);
    this.componentManager.requestUpdate();
  }
}

export interface RemoteContentConfig {
  url: string;
  method?: 'GET'|'POST';
  postBody?: any;
}