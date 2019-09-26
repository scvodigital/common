import { BaseComponent } from './base-component';
import { TaskConfig, TaskRunner, TaskRunnerContext } from '../task-runner/task-runner';

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

  handleEvent(event: Event) {
    const eventConfig = this.config[event.type];

    if (eventConfig.preventDefault) {
      event.preventDefault();
    }

    if (eventConfig.stopPropagation) {
      event.stopPropagation();
    }

    if (eventConfig.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }

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
  }
}

export interface TasksTriggerConfig {
  [event: string]: {
    tasks: TaskConfig[];
    preventDefault?: boolean;
    stopPropagation?: boolean;
    stopImmediatePropagation?: boolean;
  }
}