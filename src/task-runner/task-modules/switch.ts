import { Basic } from './basic';
import { TaskRunner, TaskRunnerContext, TaskConfig } from '../task-runner';
import { RenderConfig } from '../renderer';

export class Switch extends Basic<SwitchConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: SwitchConfig): Promise<any> {
    if (!config.branches.hasOwnProperty(config.which)) {
      throw Error(`No branch '${config.which} exists`);
    }

    const branch = config.branches[config.which];

    let output: any;
    if (branch.tasks) {
      output = await TaskRunner.run(branch.tasks, context, branch.renderOutput);
    }

    if (branch.halt) {
      output.__halt = true;
    }

    return output;
  }
}

export interface SwitchConfig {
  which: string;
  branches: { [branchName: string]: Branch }
}

export interface Branch {
  tasks?: TaskConfig[];
  halt?: boolean;
  renderOutput?: RenderConfig;
}