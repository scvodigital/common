import { Basic } from './basic';
import { TaskRunner, TaskRunnerContext, TaskConfig } from '../task-runner';
import { RenderConfig } from '../renderer';

const JsonLogicParser: any = require('json-logic-js');

export class JsonLogic extends Basic<any> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: any): Promise<any> {
    const outcome = JsonLogicParser.apply(config, context);
    let output: any;
    if (outcome.tasks) {
      output = await TaskRunner.run(outcome.tasks, context, outcome.renderOutput);
    }
    if (outcome.halt) {
      output.__halt = true;
    }
    return output;
  }
}

export interface JsonLogicOutcome {
  tasks?: TaskConfig[];
  halt?: boolean;
  renderOutput?: RenderConfig;
}