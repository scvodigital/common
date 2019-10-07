import { Basic } from './basic';
import { TaskRunner, TaskRunnerContext, TaskConfig } from '../task-runner';
import { RenderConfig } from '../renderer';

export class MultiTask extends Basic<MultiTaskConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: MultiTaskConfig): Promise<any> {
    return await TaskRunner.run(config.tasks, context, config.renderOutput);
  }
}

export interface MultiTaskConfig {
  tasks: (TaskConfig | string)[];
  renderOutput: RenderConfig;
}