import { BaseComponent } from './base-component';
import { TaskConfig, TaskRunner, TaskRunnerContext } from '../task-runner/task-runner';
import { Bristles } from 'bristles';

//TODO: Perhaps add a generic state/attribute change Custom Event?
export const CustomEventNames: string[] = [
  'visibilityChange', 'sizeChange', 'viewportProximityChange'
];

export class TasksTrigger extends BaseComponent<TasksTriggerConfig> {
  clock: number = -1;
  customEvents: { [customEventName: string]: EventConfig } = {};

  async init() {
    this.bindToEvents();
  }

  bindToEvents() {
    for (const element of Array.from(this.element)) {
      for (const eventName of Object.keys(this.config)) {
        if (!CustomEventNames.includes(eventName)) {
          element.removeEventListener(eventName, this);
          element.addEventListener(eventName, this);
        } else {
          this.customEvents[eventName] = this.config[eventName];
        }
      }
    }

    if (Object.keys(this.customEvents).length > 0) {
      this.clock = window.requestAnimationFrame(this.tick.bind(this));
    }
  }

  async tick() {
    window.cancelAnimationFrame(this.clock);

    for (const [eventName, eventConfig] of Object.entries(this.customEvents)) {
      switch (eventName) {
        case ('visibilityChange'):
          await this.checkVisibilityChangeEvent(eventConfig as VisibilityChangeEventConfig);
          break;
        case ('sizeChange'):
          await this.checkSizeChangeEvent(eventConfig as SizeChangeEventConfig);
          break;
        case ('viewportProximityChange'):
          await this.checkViewportProximityChangeEvent(eventConfig as ViewportProximityChangeEventConfig);
          break;
        case ('scrollOutOfView'):
          break;
      }
    }

    this.clock = window.requestAnimationFrame(this.tick.bind(this));
  }

  previousVisible = this.element.is(':visible');
  async checkVisibilityChangeEvent(config: VisibilityChangeEventConfig) {
    const nowVisible = this.element.is(':visible');
    if (nowVisible !== this.previousVisible) {
      const context = new TaskRunnerContext({
        metadata: {
          isVisible: nowVisible,
          instance: this,
        },
        rootElement: this.element
      });
      this.previousVisible = nowVisible;
      if (nowVisible && typeof config.visible !== 'undefined') {
        await TaskRunner.run(config.visible, context);
      } else if (!nowVisible && typeof config.hidden !== 'undefined') {
        await TaskRunner.run(config.hidden, context);
      }
    }
  }

  previousSizeState = this.getSpatial();
  async checkSizeChangeEvent(config: SizeChangeEventConfig) {
    const currentSize = this.getSpatial();
    const tasks: ContextTaskPair[] = [];
    for (const rule of config.rules) {
      const context = new TaskRunnerContext({
        metadata: {
          event: {
            rule: rule,
            previousSize: this.previousSizeState,
            newSize: currentSize
          },
          instance: this,
        },
        rootElement: this.element
      });
      if (
        (rule.direction === 'shrink' &&
          (rule.height && this.previousSizeState.height > rule.height && currentSize.height <= rule.height) ||
          (rule.width && this.previousSizeState.width > rule.width && currentSize.width <= rule.width)
        ) ||
        (rule.direction === 'grow' &&
          (rule.height && this.previousSizeState.height < rule.height && currentSize.height >= rule.height) ||
          (rule.width && this.previousSizeState.width < rule.width && currentSize.width >= rule.width)
        )) {
        tasks.push({ context: context, tasks: rule.tasks });
      }
    }

    this.previousSizeState = currentSize;

    for (const contextTaskPair of tasks) {
      await TaskRunner.run(contextTaskPair.tasks, contextTaskPair.context);
    }
  }

  getSpatial(): Spatial {
    const height = this.element.outerHeight() || this.element.height() || 0;
    const width = this.element.outerWidth() || this.element.width() || 0;
    const position = this.element.offset() || { top: 0, left: 0 };

    return {
      height: height,
      width: width,
      top: position.top,
      left: position.left,
      bottom: position.top + height,
      right: position.left + width
    };
  }

  previousViewportState = this.getViewport();
  async checkViewportProximityChangeEvent(eventConfig: ViewportProximityChangeEventConfig) {
     const currentViewport = this.getViewport();
     const currentSpatial = this.getSpatial();

     const yDirection =  this.previousViewportState.top > currentViewport.top ? 'down' :
                         this.previousViewportState.top < currentViewport.top ? 'up' :
                         null;

    if (!yDirection || currentSpatial.bottom < currentViewport.top - 50 || currentSpatial.top > currentViewport.bottom + 50) {
      return;
    }

    const aboveTop = Math.max(Math.max(currentViewport.top - currentSpatial.top, 0) / currentSpatial.height * 100, 100);
    const belowTop = 100 - aboveTop;
    const belowBottom = Math.max(Math.max(currentSpatial.bottom - currentViewport.bottom, 0) / currentSpatial.height * 100);
    const aboveBottom = 100 - belowBottom;

    for (const rule of eventConfig.rules) {
      rule.percentage = rule.percentage || 0;

      if (!rule.on) {
        if (yDirection === 'down') {
          if (rule.rule === 'enter-bottom' && aboveBottom > rule.percentage) {
            rule.on = true;
            console.log(`VIEWPORT EVENT => Rule: ${rule.rule} ${rule.on ? 'ON' : 'OFF'}. Scroll Direction: ${yDirection}`);
          }
          if (rule.rule === 'leave-top' && aboveTop > rule.percentage) {
            rule.on = true;
            console.log(`VIEWPORT EVENT => Rule: ${rule.rule} ${rule.on ? 'ON' : 'OFF'}. Scroll Direction: ${yDirection}`);
          }
        } else if (yDirection === 'up') {
          if (rule.rule === 'enter-top' && belowTop > rule.percentage) {
            rule.on = true;
            console.log(`VIEWPORT EVENT => Rule: ${rule.rule} ${rule.on ? 'ON' : 'OFF'}. Scroll Direction: ${yDirection}`);
          }
          if (rule.rule === 'leave-bottom' && belowBottom > rule.percentage) {
            rule.on = true;
            console.log(`VIEWPORT EVENT => Rule: ${rule.rule} ${rule.on ? 'ON' : 'OFF'}. Scroll Direction: ${yDirection}`);
          }
        }
      } else {
        if (yDirection === 'up') {
          if (rule.rule === 'enter-bottom' && aboveBottom <= rule.percentage) {
            rule.on = false;
            console.log(`VIEWPORT EVENT => Rule: ${rule.rule} ${rule.on ? 'ON' : 'OFF'}. Scroll Direction: ${yDirection}`);
          }
          if (rule.rule === 'leave-top' && aboveTop <= rule.percentage) {
            rule.on = false;
            console.log(`VIEWPORT EVENT => Rule: ${rule.rule} ${rule.on ? 'ON' : 'OFF'}. Scroll Direction: ${yDirection}`);
          }
        } else if (yDirection === 'down') {
          if (rule.rule === 'enter-top' && belowTop <= rule.percentage) {
            rule.on = false;
            console.log(`VIEWPORT EVENT => Rule: ${rule.rule} ${rule.on ? 'ON' : 'OFF'}. Scroll Direction: ${yDirection}`);
          }
          if (rule.rule === 'leave-bottom' && belowBottom <= rule.percentage) {
            rule.on = false;
            console.log(`VIEWPORT EVENT => Rule: ${rule.rule} ${rule.on ? 'ON' : 'OFF'}. Scroll Direction: ${yDirection}`);
          }
        }
      }
    }

    this.previousViewportState = currentViewport;
  }

  getViewport(): ViewportState {
    const scrollTop = $(window).scrollTop() || 0;
    const scrollLeft = $(window).scrollLeft() || 0;
    const height = $(window).height() || $(document).height() || 0;
    const width = $(window).width() || $(document).width() || 0;
    return {
      height: height,
      width: width,
      top: scrollTop,
      left: scrollLeft,
      bottom: scrollTop + height,
      right: scrollLeft + width,
      totalHeight: $(document).height() || $(window).height() || 0,
      totalWidth: $(document).width() || $(window).width() || 0
    }
  }


  handleEvent(event: Event) {
    const eventConfig = this.config[event.type] as StandardEventConfig;

    const context = new TaskRunnerContext({
      metadata: {
        event,
        instance: this,
      },
      rootElement: $(event.currentTarget as HTMLElement || this.element)
    });

    this.setEventFlag(event, 'preventDefault', context, eventConfig);
    this.setEventFlag(event, 'stopPropagation', context, eventConfig);
    this.setEventFlag(event, 'stopImmediatePropagation', context, eventConfig);

    TaskRunner.run(eventConfig.tasks, context).then().catch(err => {
      console.error('TasksTrigger Failed', err);
    });
  }

  setEventFlag(event: Event, flag: 'preventDefault'|'stopPropagation'|'stopImmediatePropagation', context: TaskRunnerContext, eventConfig: StandardEventConfig) {
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
  [key: string]: any;
}

export interface StandardEventConfig extends EventConfig {
  preventDefault?: boolean | string;
  stopPropagation?: boolean | string;
  stopImmediatePropagation?: boolean | string;
  tasks: TaskConfig[];
}

export interface VisibilityChangeEventConfig extends EventConfig {
  visible?: (TaskConfig | string)[];
  hidden?: (TaskConfig | string)[];
}

export interface ViewportProximityChangeEventConfig extends EventConfig {
  rules: ViewportProximityChangeEventRule[];
}

export interface ViewportProximityChangeEventRule {
  rule: 'enter-top' | 'enter-bottom' | 'leave-top' | 'leave-bottom';
  percentage?: number;
  tasks: (TaskConfig | string)[];
  on?: boolean;
}

export interface Spatial {
  height: number;
  width: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface ViewportState {
  totalHeight: number;
  totalWidth: number;
  height: number;
  width: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface SizeChangeEventConfig extends EventConfig {
  rules: SizeChangeEventRule[];
}

export interface SizeChangeEventRule {
  direction: 'shrink'|'grow';
  height?: number;
  width?: number;
  tasks: (TaskConfig | string)[];
}

export interface ContextTaskPair {
  context: TaskRunnerContext;
  tasks: (TaskConfig | string)[];
}