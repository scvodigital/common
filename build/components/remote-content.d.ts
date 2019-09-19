import { BaseComponent } from './base-component';
export declare class RemoteContent extends BaseComponent<RemoteContentConfig> {
    init(): Promise<void>;
    load(): Promise<void>;
}
export interface RemoteContentConfig {
    url: string;
    method?: 'GET' | 'POST';
    postBody?: any;
}
