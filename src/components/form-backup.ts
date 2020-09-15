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
    if (!this.canBackup) return;
    const formData = this.element.serializeArray().map((item) => {
      if (this.config.ignoreFields.includes(item.name)) {
        item.value = '[REDACTED]';
      }
      item.name = item.name.replace(/[\.\$\#\[\]\/]/g, '').substring(0, 128);
      return item;
    });
    const backup = {
      updated: new Date().toISOString(),
      valid: (this.element[0] as HTMLFormElement).checkValidity(),
      data: formData
    };
    await Firebase.database().ref(this.path).set(backup);
  }
}

export interface FormBackupConfig {
  name: string;
  idsSelector: string;
  ignoreFields: string[];
}