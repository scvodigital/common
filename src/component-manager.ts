import { BaseComponent } from './components/base-component';

import { LeafletMap } from './components/leaflet-map';
import { Typeahead } from './components/typeahead';
import { TasksTrigger } from './components/tasks-trigger';
import { TaskRunner } from './task-runner/task-runner';
import { Bristles } from 'bristles';

require('./components.scss');

export class ComponentManager {
  components: { [name: string]: any } = {
    LeafletMap,
    Typeahead,
    TasksTrigger
  };
  componentRegistry: ComponentRegistry = {};
  clock = window.requestAnimationFrame(this.tick.bind(this));

  private updateRequested = false;
  requestUpdate() {
    this.updateRequested = true;
  }

  constructor() {
    this.requestUpdate();
  }

  async registerComponents() {
    await this.unregisterComponents();

    const componentElements = Array.from($('[data-component]')).map(item => $(item));
    for (const componentElement of componentElements) {
      const typeNames = componentElement.data('component') || '';
      for (const typeName of typeNames.split(',')) {
        if (!this.components.hasOwnProperty(typeName)) throw new Error('Invalid component name: ' + typeName);

        const uid = componentElement.data(typeName + '-uid');
        if (uid) continue;

        const type = this.components[typeName] as typeof BaseComponent;
        const component = new type(componentElement, this);
        await component.init();
        this.componentRegistry[component.uid] = component;
      }
    }
  }

  async unregisterComponents() {
    for (const component of Object.values(this.componentRegistry)) {
      await component.destroy();
    }
    this.componentRegistry = {};
  }

  async tick() {
    window.cancelAnimationFrame(this.clock);

    if (this.updateRequested) {
      await this.registerComponents();
      this.updateRequested = false;
    }

    this.clock = window.requestAnimationFrame(this.tick.bind(this));
  }
}

export interface ComponentRegistry {
  [element: string]: BaseComponent<any>;
}

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    (window as any).ComponentManager = new ComponentManager();
    (window as any).TaskRunner = TaskRunner;
    (window as any).Bristles = Bristles;
  });
})();