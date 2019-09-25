import { Basic } from './basic';
import { TaskRunner, TaskRunnerContext, TaskConfig } from '../task-runner';

export class Delay extends Basic<DelayConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: DelayConfig, root: JQuery<HTMLElement>): Promise<any> {
    for (const [delay, tasks] of Object.entries(config)) {
      const ms = Number(delay) || 0;
      setTimeout(async () => {
        await TaskRunner.run(tasks, context, root);
      }, ms);
    }
  }
}

export interface DelayConfig {
  [delay: string]: TaskConfig[];
}