// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseLinkProvider extends FirebaseBase<FirebaseLinkProviderConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseLinkProviderConfig): Promise<any> {
    try {
      if (!this.providers[config.providerId]) {
        throw new Error(`Provider '${config.providerId}' does not exist`);
      }

      if (!this.currentUser) {
        throw new Error('Not signed in');
      }

      if (this.currentProfiles.hasOwnProperty(config.providerId)) {
        throw new Error(`Already linked to provider ${config.providerId}`);
      }

      await this.reAuthenticate(config.currentPassword);

      const newProvider = this.providers[config.providerId].provider;
      await this.currentUser.linkWithPopup(newProvider);

      return true;
    } catch(err) {
      console.error('Failed to link to provider', err, config);
      throw err;
    }
  }
}

export interface FirebaseLinkProviderConfig {
  providerId: string;
  currentPassword?: string;
}