import { BaseComponent } from './base-component';
import { ComponentManager } from '../component-manager';

import * as Firebase from 'firebase/app';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/database';

export class FormBackup extends BaseComponent<FormBackupConfig> {
  get canBackup() {
    return this.id && Firebase.auth().currentUser;
  }
  get prefix() {
    return `FormBackup [${this.config.name}] ->`;
  }
  get id() {
    const idFields = $(this.config.idsSelector).toArray();
    const ids = idFields.map((element) => $(element).val());
    const id = ids.join('-').replace(/[\.\$\#\[\]\/]/g, '').substring(0, 128);
    return id;
  }
  get path() {
    const user = Firebase.auth().currentUser;
    const uid = user && user.uid || 'unknown';
    return `/form_backups/${this.config.name}/${this.id}/${this.timestamp}/${uid}`;
  }
  timestamp: string;

  constructor(element: Element | JQuery<HTMLElement>, componentManager: ComponentManager) {
    super(element, componentManager);
    this.timestamp = new Date().toISOString().replace(/[^0-9]/g, '-').slice(0, -1);
  }

  async init() {
    try {
      this.element.attr('data-form-backup-id', this.uid);
      await this.anonymousSignIn();
      this.element.on('change', this.formChange.bind(this));
    } catch(err) {
      console.error(`${this.prefix} Init error: ${err.message}`);
    }
  }

  async anonymousSignIn() {
    const user = Firebase.auth().currentUser || (await Firebase.auth().signInAnonymously()).user;
    if (!user) {
      console.error(`${this.prefix} Could not authenticate`);
    } else {
      console.log(`${this.prefix} Signed in as ${user.uid}`);
    }
  }

  async formChange(evt: JQuery.Event) {
    try {
      if (!this.canBackup) {
        console.log(`${this.prefix} Can't backup form. Either couldn't authenticate or there is no data in the ID field`)
        return;
      };
      const formData = this.element.serializeArray().map((item: any) => {
        if (this.config.ignoreFields.includes(item.name)) {
          item.value = '[REDACTED]';
        }
        item.label = this.findLabel(item.name);
        item.name = item.name.replace(/[\.\$\#\[\]\/]/g, '').substring(0, 128);
        return item;
      });
      const backup = {
        updated: new Date().toISOString(),
        valid: (this.element[0] as HTMLFormElement).checkValidity(),
        data: formData
      };
      await Firebase.database().ref(this.path).set(backup);
      console.log(`${this.prefix} Backed up`, backup);
    } catch(err) {
      console.error(`${this.prefix} Error backing up form: ${err.message}`);
    }
  }

  findLabel(name: string) {
    try {
      let labelElement: null | JQuery<HTMLElement> = null;

      const element = $(`[data-form-backup-id="${this.uid}"] [name="${name}"]`);
      if (element.length === 0) return '';

      const id = element.attr('id');
      if (id) {
        labelElement = $(`[data-form-backup-id="${this.uid}"] label[for="${id}"]`);
      }

      if (!labelElement || labelElement.length === 0) {
        labelElement = $(element).parents('label');
      }

      const label = labelElement.text();
      return label;
    } catch(err) {
      console.error(`${this.prefix} Error finding label for '${name}': ${err.message}`);
    }
    return '';
  }
}

export interface FormBackupConfig {
  name: string;
  idsSelector: string;
  ignoreFields: string[];
}