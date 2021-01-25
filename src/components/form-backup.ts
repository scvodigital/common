import { BaseComponent } from './base-component';
import { ComponentManager } from '../component-manager';

// tslint:disable-next-line: no-import-side-effect
import 'jquery-deserialize';

import * as Firebase from 'firebase/app';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/database';

export class FormBackup extends BaseComponent<FormBackupConfig> {
  isRecovering = false;
  get canBackup() {
    return this.id && Firebase.auth().currentUser && !this.isRecovering;
  }
  get prefix() {
    return `FormBackup [${this.config.name}] ->`;
  }
  get restorePrefix() {
    return '#restore:';
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
      this.restore();
      this.element.on('change', this.formChange.bind(this));
    } catch(err) {
      console.error(`${this.prefix} Init error: ${err.message}`);
    }
  }

  restore() {
    try {
      if (window.location.hash.startsWith(this.restorePrefix)) {
        this.isRecovering = true;
        const serialised = window.location.hash.substring(this.restorePrefix.length);
        ($(`[data-form-backup-id="${this.uid}"]`) as any).deserialize(serialised);
        $(`[data-form-backup-id="${this.uid}"] input, [data-form-backup-id="${this.uid}"] select, [data-form-backup-id="${this.uid}"] textarea`).each((i, o) => {
          try { $(o).trigger('change'); } catch(err) {}
        });
        window.setTimeout(() => {
          try {
            (window as any).wFORMS.applyBehaviors(this.element);
          } catch (err) {}
        }, 100);
      }
    } catch(err) {
      console.error(`${this.prefix} Failed to resume: ${err.message}`);
    }
    this.isRecovering = false;
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
        if (this.config.ignoreFields.includes(item.name) && item.value) {
          item.value = '[REDACTED]';
        }
        item.label = this.findLabel(item.name);
        item.name = item.name.replace(/[\.\$\#\[\]\/]/g, '').substring(0, 128);
        return item;
      });
      const restoreUrl = new URL(window.location.href);
      restoreUrl.hash = this.restorePrefix.substring(1) + this.element.serialize();
      const backup = {
        updated: new Date().toISOString(),
        valid: (this.element[0] as HTMLFormElement).checkValidity(),
        data: formData,
        restoreUrl: restoreUrl.href
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

      const label = labelElement.text().replace(/[\r\n]/g, ' ').replace(/\s{2,}/g, ' ');
      return label.trim();
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