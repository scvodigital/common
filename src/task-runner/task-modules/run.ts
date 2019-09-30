// tslint:disable-next-line: no-import-side-effect

import { TaskRunnerContext, TaskConfig } from '../task-runner';
import { Basic } from './basic';

export class Run extends Basic<any> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: RunConfig): Promise<any> {
    try {
      const output = this.safeEval(config.code, config.useWindow ? window : context);
      return output;
    } catch(err) {
      console.error('Failed to safely evaluate Dom Manipulator rule', err);
    }
  }

  safeEval(fn: string, context: any) {
    return Function('"use strict"; return (' + fn + ')')()(context);
  }
}

export interface RunConfig {
  useWindow?: boolean;
  code: string;
}