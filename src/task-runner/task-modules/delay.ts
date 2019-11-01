import { Basic } from './basic';
import { TaskRunner, TaskRunnerContext, TaskConfig } from '../task-runner';

export class Delay extends Basic<DelayConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: DelayConfig): Promise<any> {
    for (const [delay, tasks] of Object.entries(config)) {
      const ms = Number(delay) || 0;
      setTimeout(async () => {
        await TaskRunner.run(tasks, context);
      }, ms);
    }
  }
}

export interface DelayConfig {
  [delay: string]: TaskConfig[];
}