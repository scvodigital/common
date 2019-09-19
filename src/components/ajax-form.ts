import * as Querystring from 'querystring';

import { BaseComponent } from "./base-component";
import { DomManipulatorRules, DomManipulator } from "../dom-utilities";

export class AjaxForm extends BaseComponent<AjaxFormConfig> {
  isLoading: boolean = false;

  getContext(): AjaxFormContext {
    return {
      window,
      $,
      data: this.element.serialize(),
      instance: this,
    };
  }

  async init() {
    this.element.on('submit', this.submit.bind(this));
  }

  submit(event: JQuery.SubmitEvent) {
    event.preventDefault();

    const url = this.element.attr('action') || '/';
    const method = this.element.attr('method') || 'GET';
    const data = Querystring.parse(this.element.serialize());

    if (this.config.onSubmitRules) {
      DomManipulator(this.config.onSubmitRules, this.element, this.getContext());
    }

    console.log(url, method, data);

    this.navigate(url, method, data, this.onSuccess.bind(this), this.onError.bind(this)).then(() => {
      console.log('Submitting', url, method, data);
    }).catch(err => {
      console.error('Failed to submit', err);
    });
  }

  navigate(url: string, method: string = 'GET', data: any = {}, successCallback?: SuccessCallback, errorCallback?: ErrorCallback): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.isLoading) {
        resolve();
        return;
      }
      this.isLoading = true;

      let ajaxSettings: JQueryAjaxSettings = {};

      try {
        const parsed = url.match(/^https?:/) ? new URL(url) : new URL(url, window.location.origin);

        ajaxSettings = {
          async: false,
          dataType: 'html',
          beforeSend: function(jqXHR, settings){ return; },
          method: method,
          complete: async () => {
            this.isLoading = false;
            resolve();
          },
          success: (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR) => {
            console.log(response.toString());
            if (successCallback) {
              successCallback(response, status, xhr);
            }
          },
          error: (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string) => {
            console.log(status);
            if (errorCallback) {
              errorCallback(xhr, status, error);
            }
          }
        };

        if (method === 'GET') {
          if (parsed.search) {
            const overrides = Querystring.parse(parsed.search.substr(1));
            Object.assign(data, overrides);
          }
          parsed.search = Querystring.stringify(data);
        } else {
          ajaxSettings.data = data;
        }

        ajaxSettings.url = parsed.href;
      } catch (err) {
        this.isLoading = false;
        reject(err);
      }
    });
  }

  onSuccess(response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR) {
    if (this.config.onSuccessRules) {
      const context = this.getContext() as AjaxFormSuccessContext;
      context.xhr = xhr;
      context.response = response;
      context.status = status;
      DomManipulator(this.config.onSuccessRules, this.element, context);
    }
  }

  onError(xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string) {
    if (this.config.onErrorRules) {
      const context = this.getContext() as AjaxFormErrorContext;
      context.xhr = xhr;
      context.status = status;
      context.error = error;
      DomManipulator(this.config.onSuccessRules, this.element, context);
    }
  }
}

export interface AjaxFormConfig {
  onSubmitRules: DomManipulatorRules;
  onSuccessRules: DomManipulatorRules;
  onErrorRules: DomManipulatorRules;
}

export interface AjaxFormContext {
  instance: AjaxForm;
  window: Window;
  $: JQueryStatic;
  data: any;
}

export interface AjaxFormSuccessContext extends AjaxFormContext {
  xhr: JQuery.jqXHR;
  status: JQuery.Ajax.SuccessTextStatus;
  response: any;
}

export interface AjaxFormErrorContext extends AjaxFormContext {
  xhr: JQuery.jqXHR;
  status: JQuery.Ajax.ErrorTextStatus;
  error: string;
}

export interface SuccessCallback {
  (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR): void;
}

export interface ErrorCallback {
  (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string): void;
}