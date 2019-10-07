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
          await this.checkScrollProximityChangeEvent(eventConfig as ScrollProximityChangeEventConfig);
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

  previousSizeState = this.getElementGeometry();
  async checkSizeChangeEvent(config: SizeChangeEventConfig) {
    const currentSize = this.getElementGeometry();
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

  getElementGeometry(element: JQuery = this.element): Geometry {
    const height = element.outerHeight() || element.height() || 0;
    const width = element.outerWidth() || element.width() || 0;
    const position = element.offset() || { top: 0, left: 0 };

    return {
      height: height,
      width: width,
      top: position.top,
      left: position.left,
      bottom: position.top + height,
      right: position.left + width
    };
  }

  getViewportGeometry(): Geometry {
    const scrollTop = $(window).scrollTop() || 0;
    const scrollLeft = $(window).scrollLeft() || 0;
    const height = $(window).height() || 0;
    const width = $(window).width() || 0;

    return {
      height: height,
      width: width,
      top: scrollTop,
      left: scrollLeft,
      bottom: scrollTop + height,
      right: scrollLeft + width
    }
  }

  previousScrollTop = -1;
  async checkScrollProximityChangeEvent(eventConfig: ScrollProximityChangeEventConfig) {
    const viewportGeometry = this.getViewportGeometry();
    const scrollDirection = this.previousScrollTop < viewportGeometry.top ? 'down' :
                            this.previousScrollTop > viewportGeometry.top ? 'up' :
                            null;

    if (!scrollDirection) {
      return;
    }

    this.previousScrollTop = viewportGeometry.top;

    const sourceGeometry = this.getElementGeometry();
    for (const rule of eventConfig.rules) {
      const previousRuleState = rule.on;

      if (rule.scrollDirection === scrollDirection && rule.on) continue;
      if (rule.scrollDirection !== scrollDirection && !rule.on) continue;

      const sourceEdge = rule.sourceEdge || 'top';
      let sourceOffset = rule.sourceOffset || 0;
      let sourceCoord = sourceEdge === 'bottom' ? sourceGeometry.bottom : sourceGeometry.top;

      if (typeof sourceOffset === 'string' && sourceOffset.match(/^-?[0-9]{1,2}(\.[0-9]+)?$/)) {
        sourceOffset = Number(sourceOffset.replace('%', ''));
        sourceOffset = (100 / sourceGeometry.height) * sourceOffset;
        sourceCoord = sourceCoord + sourceOffset;
      } else if (typeof sourceOffset === 'number') {
        sourceCoord = sourceCoord + sourceOffset;
      }

      const targetGeometry = typeof rule.targetSelector === 'undefined' || rule.targetSelector === 'viewport' ? viewportGeometry : this.getElementGeometry($(rule.targetSelector));
      const targetEdge =
        ['top', 'bottom'].includes(rule.targetEdge || '') ? rule.targetEdge :
        sourceEdge === 'top' ? 'bottom' : 'top';
      let targetOffset = rule.targetOffset || 0;
      let targetCoord = targetEdge === 'bottom' ? targetGeometry.bottom : targetGeometry.top;

      if (typeof targetOffset === 'string' && targetOffset.match(/^-?[0-9]{1,2}(\.[0-9]+)?$/)) {
        targetOffset = Number(targetOffset.replace('%', ''));
        targetOffset = (100 / targetGeometry.height) + targetOffset;
        targetCoord = targetCoord + targetOffset;
      } else if (typeof targetOffset === 'number') {
        targetCoord = targetCoord + targetOffset;
      }

      if (rule.scrollDirection === scrollDirection && !rule.on) {
        rule.on =
          (scrollDirection === 'down' && targetCoord > sourceCoord) ||
          (scrollDirection === 'up' && targetCoord < sourceCoord);
      } else if (rule.scrollDirection !== scrollDirection && rule.on) {
        rule.on =
          (scrollDirection === 'down' && targetCoord < sourceCoord) ||
          (scrollDirection === 'up' && targetCoord > sourceCoord);
      }

      if (!previousRuleState && rule.on) {
        const context = new TaskRunnerContext({
          metadata: {
            event: {
              rule,
              sourceGeometry: sourceGeometry,
              targetGeometry: targetGeometry,
              sourceEdge,
              targetEdge,
              sourceOffset,
              targetOffset,
              scrollDirection
            },
            instance: this,
          },
          rootElement: this.element
        });
        await TaskRunner.run(rule.tasks, context);
      }
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

export interface ScrollProximityChangeEventConfig extends EventConfig {
  rules: ScrollProximityChangeEventRule[];
}

export interface ScrollProximityChangeEventRule {
  scrollDirection: 'up' | 'down';
  sourceEdge?: 'top' | 'bottom';
  sourceOffset?: number | string;
  targetSelector?: string;
  targetEdge?: 'top' | 'bottom';
  targetOffset?: number | string;
  tasks: (TaskConfig | string)[];
  on?: boolean;
}

export interface Geometry {
  height: number;
  width: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
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