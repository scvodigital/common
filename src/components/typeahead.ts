import { BaseComponent } from "./base-component";
import { TaskConfig, TaskRunnerContext, TaskRunner } from "../task-runner/task-runner";

// tslint:disable-next-line: no-implicit-dependencies
require('imports-loader?define=>false!typeahead.js/dist/typeahead.jquery.min.js');
// tslint:disable-next-line: no-implicit-dependencies
const Bloodhound = require('imports-loader?define=>false!typeahead.js/dist/bloodhound.min.js');

export const BloodhoundTokenizers = {
  nonword: Bloodhound.tokenizers.nonword,
  whitespace: Bloodhound.tokenizers.whitespace,
  objNonword: Bloodhound.tokenizers.obj.nonword,
  objWhitespace: Bloodhound.tokenizers.obj.whitespace
}

//TODO: This builds but is throwing JS errors on coronavirus
//      All I've added are props for current data and am setting it in Bloodhound remote transform method

export class Typeahead extends BaseComponent<TypeaheadConfig> {
  typeahead: any;
  selectedItem: any;
  selectedItemDisplay: string|null = null;
  autocompleted: boolean = false;
  datasets: { [name: string]: TypeaheadDataset } = {};
  textbox = this.element.find('input');
  currentLocalData: any[] = [];
  currentRemoteData: any[] = [];

  async init() {
    this.setupTypeahead();
  }

  setupTypeahead() {
    const typeaheadArgs: any[] = [this.config.typeaheadOptions || {}];
    this.config.datasets = this.config.datasets.filter(Boolean);
    for (const dataset of this.config.datasets) {
      if (dataset.bloodhound.local) {
        for (const item of dataset.bloodhound.local) {
          item.datasetName = dataset.name;
        }
      }

      const datumTokenizerField = dataset.bloodhound.datumTokenizerField;
      const bloodhoundOptions: any = {
        datumTokenizer: datumTokenizerField ?
        BloodhoundTokenizers[dataset.bloodhound.datumTokenizer](datumTokenizerField) :
        BloodhoundTokenizers[dataset.bloodhound.datumTokenizer],
        queryTokenizer: BloodhoundTokenizers[dataset.bloodhound.queryTokenizer],
        local: dataset.bloodhound.local ? dataset.bloodhound.local.filter(Boolean) : [],
        initialize: dataset.bloodhound.hasOwnProperty('initialize') ? dataset.bloodhound.initialize : true,
        sufficient: dataset.bloodhound.sufficient || 5,
        prefetch: dataset.bloodhound.prefetch || undefined,
        remote: dataset.bloodhound.remote || undefined
      }

      if (bloodhoundOptions.remote) {
        bloodhoundOptions.remote.transform = (response: any) => {
          if (!this.textbox.val()) {
            console.log('Closing tt-menu because no search query');
            this.clearSelection();
            this.closeAutocomplete();
            this.currentRemoteData = [];
            return [];
          }

          if (!Array.isArray(response)) {
            this.currentRemoteData = [];
            return response;
          }

          for (let item of response) {
            if (typeof item !== 'object') {
              item = { value: item };
            }
            item.datasetName = dataset.name;
          }

          this.currentRemoteData = response;
          return response;
        };
      }

      const engine = new Bloodhound(bloodhoundOptions);

      dataset.source = engine;
      typeaheadArgs.push(dataset);
      this.datasets[dataset.name] = dataset;
    }

    this.typeahead = (this.textbox as any).typeahead.apply(this.textbox, typeaheadArgs);
    this.typeahead
      .on('typeahead:select', (ev: any, suggestion: any) => {
        this.autocompleted = true;
        this.typeaheadSelect(ev, suggestion);
      })
      .on('typeahead:autocomplete', (ev: any, suggestion: any) => {
        this.autocompleted = true;
        this.typeaheadSelect(ev, suggestion);
      })
      .on('keydown', async (ev: any) => {
        this.exitStarted = false;
        switch (ev.keyCode) {
          case (9):
            if (this.autocompleted) {
              ev.preventDefault();
            } else {
              this.nothingSelected();
            }
            break;
          case (13):
            if (this.autocompleted) {
              ev.preventDefault();
            } else {
              this.nothingSelected();
            }
            break;
        }
        this.autocompleted = false;
      })
      .on('blur', async (ev: any) => {
        if (!this.autocompleted && !this.exitStarted) {
          this.nothingSelected();
        }
      });
  }

  clearSelection() {
    this.textbox.val('');
    (this.textbox as any).typeahead('val', '');
    this.nothingSelected();
    this.currentLocalData = [];
    this.currentRemoteData = [];
  }

  closeAutocomplete() {
    (this.textbox as any).typeahead('close');
    this.element.find('.tt-menu').css('display', 'none');
  }

  //TODO? The following two methods are both called in async functions,
  //      as they call async code should they not also be async.
  //      Apparently some of the event handlers are async and that works?!
  typeaheadSelect(event: any, suggestion: any) {
    this.selectedItem = suggestion;
    const dataset = this.datasets[suggestion.datasetName] || null;
    if (dataset && dataset.display && suggestion[dataset.display]) {
      this.selectedItemDisplay = suggestion[dataset.display];
    } else {
      for (const [key, value] of Object.entries(suggestion)) {
        if (key !== 'datasetName' && typeof value === 'string') {
          this.selectedItemDisplay = value;
          break;
        }
      }
    }
    console.log('Selected item', this.selectedItemDisplay, this.selectedItem);

    if (this.config.itemSelectedTasks) {
      const context = new TaskRunnerContext({
        metadata: {
          event,
          suggestion,
          dataset,
          instance: this,
          currentLocalData: this.currentLocalData,
          currentRemoteData: this.currentRemoteData
        },
        rootElement: this.element
      });
      TaskRunner.run(this.config.itemSelectedTasks, context).then().catch(err => console.error);
    }
  }

  exitStarted = false;
  nothingSelected() {
    if (this.selectedItemDisplay === this.textbox.val()) {
      console.log(`Nothing selected but value in input '${this.textbox.val()}' is the same as the last selected item '${this.selectedItemDisplay}' so returning`);
      return;
    }

    if (this.exitStarted) {
      console.log(`Exit process has started, don't want to get stuck in a loop!`);
      return;
    }

    this.exitStarted = true;

    console.log('Nothing selected');
    if (this.config.nothingSelectedTasks) {
      const context = new TaskRunnerContext({
        metadata: {
          event,
          instance: this,
          currentLocalData: this.currentLocalData,
          currentRemoteData: this.currentRemoteData
        },
        rootElement: this.element
      });
      TaskRunner.run(this.config.nothingSelectedTasks, context).then().catch(err => console.error);
    }

    this.currentLocalData = [];
    this.currentRemoteData = [];
  }
}

export interface TypeaheadConfig {
  typeaheadOptions?: TypeaheadOptions;
  itemSelectedTasks?: (TaskConfig | string)[];
  nothingSelectedTasks?: (TaskConfig | string)[];
  datasets: TypeaheadDataset[];
}

export interface TypeaheadOptions {
  highlight?: boolean;
  hint?: boolean;
  minLength?: number;
  className?: TypeaheadClassNames;
}

export interface TypeaheadClassNames {
  input?: string;
  hint?: string;
  menu?: string;
  dataset?: string;
  suggestion?: string;
  empty?: string;
  open?: string;
  cursor?: string;
  highlight?: string;
}

export interface TypeaheadDataset {
  name: string;
  limit?: number;
  display?: string;
  templates?: TypeaheadDatasetTemplates;
  bloodhound: BloodhoundOptions;
  source?: any;
}

export interface TypeaheadDatasetTemplates {
  notFound?: string;
  pending?: string;
  header?: string;
  footer?: string;
  suggestion?: string;
}

export interface BloodhoundOptions {
  datumTokenizer: 'nonword'|'whitespace'|'objNonword'|'objWhitespace';
  datumTokenizerField: string;
  queryTokenizer: 'nonword'|'whitespace'|'objNonword'|'objWhitespace';
  initialize?: boolean;
  sufficient?: number;
  local?: any[];
  prefetch?: string|BloodhoundPrefetchOptions;
  remote?: string|BloodhoundRemoteOptions;
}

export interface BloodhoundPrefetchOptions {
  url: string;
  cache?: boolean;
  ttl?: number;
  cacheKey?: string;
  thumbprint?: string;
}

export interface BloodhoundRemoteOptions {
  url: string;
  wildcard?: string;
  rateLimitBy?: 'debounce'|'throttle';
  rateLimitWait?: number;
}
