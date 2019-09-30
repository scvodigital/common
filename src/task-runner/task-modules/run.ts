// tslint:disable-next-line: no-import-side-effect

import { TaskRunnerContext, TaskConfig } from '../task-runner';
import { Basic } from './basic';

export class Run extends Basic<any> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: RunConfig): Promise<any> {
    try {
      const func = (new Function(`with(this) { return ${config.code} }`));
      const runContext = config.useWindow ? window : context;
      return func.call(runContext);
    } catch(err) {
      console.error('Failed to safely evaluate Dom Manipulator rule', err);
    }
  }
}

export interface RunConfig {
  useWindow?: boolean;
  code: string;
}