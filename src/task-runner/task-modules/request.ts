import { Basic } from './basic';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class Request extends Basic<JQueryAjaxSettings> {
  main(context: TaskRunnerContext, taskConfig: TaskConfig, config: JQueryAjaxSettings, root: JQuery<HTMLElement>): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      config.success = (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR) => {
        resolve(response);
      };
      config.error = (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string) => {
        reject(new Error(`Reason: ${status}. Message: ${error}`));
      };
    });
  }
}