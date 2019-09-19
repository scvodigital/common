import * as Querystring from 'querystring';

import { BaseComponent } from "./base-component";
import { DomManipulatorRules, DomManipulator } from "../dom-utilities";

export class AjaxForm extends BaseComponent<AjaxFormConfig> {
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

    //this.widget.navigationManager.navigate(url, method, data, this.onSuccess.bind(this), this.onError.bind(this)).then(() => {
    //  console.log('Submitting', url, method, data);
    //}).catch(err => {
    //  console.error('Failed to submit', err);
    //});
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