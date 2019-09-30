// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseChangeEmail extends FirebaseBase<FirebaseChangeEmailConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseChangeEmailConfig): Promise<any> {
    try {
      if (!config.currentPassword) {
        throw new Error('No current password was provided');
      }

      config.email = config.email.toLowerCase();
      config.emailConfirm = config.emailConfirm.toLowerCase();

      if (config.email !== config.emailConfirm) {
        throw new Error('The two emails entered do not match');
      }

      if (!this.currentUser) {
        throw new Error('Not signed in');
      }

      if (!this.currentUser.email) {
        throw new Error('Current user has not authenticated by Email before');
      }

      await this.reAuthenticate(config.currentPassword);

      await this.currentUser.updateEmail(config.email);

      return true;
    } catch(err) {
      console.error('Failed to change email', err, config);
      throw err;
    }
  }
}

export interface FirebaseChangeEmailConfig {
  email: string;
  emailConfirm: string;
  currentPassword: string;
}