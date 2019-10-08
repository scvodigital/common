import { Basic } from './basic';
import { TaskRunnerContext, TaskConfig } from '../task-runner';
import { Exception } from '../../exception';

export class Request extends Basic<JQueryAjaxSettings> {
  main(context: TaskRunnerContext, taskConfig: TaskConfig, config: JQueryAjaxSettings): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      config.success = (response: any, status: JQuery.Ajax.SuccessTextStatus, xhr: JQuery.jqXHR) => {
        resolve(response);
      };
      config.error = (xhr: JQuery.jqXHR, status: JQuery.Ajax.ErrorTextStatus, error: string) => {
        reject(new Exception(`Reason: ${status}. Message: ${error}`));
      };
      $.ajax(config);
    });
  }
}