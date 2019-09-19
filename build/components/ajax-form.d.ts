/// <reference types="jquery" />
import { BaseComponent } from "./base-component";
import { DomManipulatorRules } from "../dom-utilities";
export declare class AjaxForm extends BaseComponent<AjaxFormConfig> {
    getContext(): AjaxFormContext;
    init(): Promise<void>;
    submit(event: JQuery.SubmitEvent): void;
    onSuccess(response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR): void;
    onError(xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string): void;
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
