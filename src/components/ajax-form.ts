import * as Querystring from 'querystring';

import { BaseComponent } from "./base-component";
import { DomManipulatorRules, DomManipulator } from "../dom-manipulator";

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
    this.doSubmit().then().catch();
  }

  async doSubmit() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;

    const url = this.element.attr('action') || '/';
    const method = this.element.attr('method') || 'GET';
    const data = Querystring.parse(this.element.serialize());

    if (this.config.onSubmitRules) {
      await DomManipulator(this.config.onSubmitRules, this.element, this.getContext());
    }

    let ajaxSettings: JQueryAjaxSettings = {};

    try {
      const parsed = url.match(/^https?:/) ? new URL(url) : new URL(url, window.location.origin);

      ajaxSettings = {
        async: true,
        dataType: 'html',
        beforeSend: function(jqXHR, settings){ return; },
        method: method,
        complete: async () => {
          this.isLoading = false;
          if (this.config.onCompleteRules) {
            await DomManipulator(this.config.onCompleteRules, this.element, this.getContext());
          }
        },
        success: async (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR) => {
          if (this.config.onSuccessRules) {
            const context: AjaxFormSuccessContext = Object.assign(this.getContext(), { xhr, status, response });
            await DomManipulator(this.config.onSuccessRules, this.element, context);
          }
        },
        error: async (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string) => {
          await this.onError(xhr, status, error);
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

      $.ajax(ajaxSettings);
    } catch (err) {
      this.isLoading = false;
      await this.onError(null, 'abort', err);
    }
  }

  async onSuccess(response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR) {
    if (this.config.onSuccessRules) {
      const context = this.getContext() as AjaxFormSuccessContext;
      context.xhr = xhr;
      context.response = response;
      context.status = status;
      await DomManipulator(this.config.onSuccessRules, this.element, context);
    }
  }

  async onError(xhr: JQuery.jqXHR|null, status: JQuery.Ajax.ErrorTextStatus, error: string) {
    if (this.config.onErrorRules) {
      const context = this.getContext() as AjaxFormErrorContext;
      context.xhr = xhr;
      context.status = status;
      context.error = error;
      await DomManipulator(this.config.onSuccessRules, this.element, context);
    }
  }
}

export interface AjaxFormConfig {
  onSubmitRules: DomManipulatorRules;
  onSuccessRules: DomManipulatorRules;
  onErrorRules: DomManipulatorRules;
  onCompleteRules: DomManipulatorRules;
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
  xhr: JQuery.jqXHR|null;
  status: JQuery.Ajax.ErrorTextStatus;
  error: string;
}

export interface SuccessCallback {
  (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR): void;
}

export interface ErrorCallback {
  (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string): void;
}