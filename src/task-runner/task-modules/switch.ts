import { Basic } from './basic';
import { TaskRunner, TaskRunnerContext, TaskConfig } from '../task-runner';
import { RenderConfig } from '../renderer';

export class Switch extends Basic<SwitchConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: SwitchConfig): Promise<any> {
    let branch: Branch|undefined;

    if (config.branches.hasOwnProperty(config.which)) {
      branch = config.branches[config.which];
    } else if (config.branches.default) {
      branch = config.branches.default;
    } else {
      throw new Error(`No branch called '${config.which}' or 'default' exists`);
    }

    let output: any;
    if (branch.tasks) {
      output = await TaskRunner.run(branch.tasks, context, branch.renderOutput);
    }

    if (branch.halt) {
      if (!output) {
        output = {};
      }
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