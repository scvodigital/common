import { ObjectCompiler } from '../object-compiler';
import { TaskConfig, TaskRunnerContext } from '../task-runner';

export class Basic<T> {
  get moduleType(): string {
    return this.constructor.name;
  }

  async execute(context: TaskRunnerContext, task: TaskConfig, root?: JQuery<HTMLElement>): Promise<any> {
    const coreConfig = await ObjectCompiler.compile(task.config, context) as T;
    const output = await this.main(context, task, coreConfig, root);
    return output;
  }

  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: T, root?: JQuery<HTMLElement>): Promise<any> {
    return config;
  }
}