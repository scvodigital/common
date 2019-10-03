import { BaseComponent } from './base-component';
import { TaskConfig, TaskRunner, TaskRunnerContext } from '../task-runner/task-runner';
import { Bristles } from 'bristles';
import { BooleanParser } from '../task-runner/parsers/boolean-parser';

export class TasksTrigger extends BaseComponent<TasksTriggerConfig> {
  async init() {
    this.bindToEvents();
  }

  bindToEvents() {
    for (const element of Array.from(this.element)) {
      for (const eventName of Object.keys(this.config)) {
        element.removeEventListener(eventName, this);
        element.addEventListener(eventName, this);
      }
    }
  }

  booleanParser: BooleanParser = new BooleanParser();

  handleEvent(event: Event) {
    const eventConfig = this.config[event.type];

    const context = new TaskRunnerContext({
      metadata: {
        event,
        instance: this,
      },
      rootElement: $(event.currentTarget as HTMLElement || this.element)
    });

    TaskRunner.run(eventConfig.tasks, context).then().catch(err => {
      console.error('TasksTrigger Failed', err);
    });

    this.setEventFlag(event, 'preventDefault', context, eventConfig);
    this.setEventFlag(event, 'stopPropagation', context, eventConfig);
    this.setEventFlag(event, 'stopImmediatePropagation', context, eventConfig);

  }

  setEventFlag(event: Event, flag: 'preventDefault'|'stopPropagation'|'stopImmediatePropagation', context: TaskRunnerContext, eventConfig: EventConfig) {
    let value: boolean|string|undefined = eventConfig[flag];
    if (typeof value === 'string') {
      const rendered = Bristles.compile(value)(context);
      value = ['yes','1', 'true', 'aye'].includes(rendered.toLowerCase().trim());
    }
    if (typeof value === 'boolean' && value === true) {
      event[flag]();
    }
  }
}

export interface TasksTriggerConfig {
  [event: string]: EventConfig;
}

export interface EventConfig {
  tasks: TaskConfig[];
  preventDefault?: boolean | string;
  stopPropagation?: boolean | string;
  stopImmediatePropagation?: boolean | string;
}