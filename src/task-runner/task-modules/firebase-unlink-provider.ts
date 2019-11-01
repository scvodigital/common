// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseUnlinkProvider extends FirebaseBase<FirebaseUnlinkProviderConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseUnlinkProviderConfig): Promise<any> {
    try {
      if (!this.providers[config.providerId]) {
        throw new Error(`Provider '${config.providerId}' does not exist`);
      }

      if (!this.currentUser) {
        throw new Error('Not signed in');
      }

      if (!this.currentProfiles.hasOwnProperty(config.providerId)) {
        throw new Error(`User has not linked to provider ${config.providerId}`);
      }

      await this.currentUser.unlink(config.providerId);

      return true;
    } catch(err) {
      console.error('Failed to unlink provider', err, config);
      throw err;
    }
  }
}

export interface FirebaseUnlinkProviderConfig {
  providerId: string;
}