// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseChangePassword extends FirebaseBase<FirebaseChangePasswordConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseChangePasswordConfig): Promise<any> {
    try {
      if (!config.currentPassword) {
        throw new Error('No current password was provided');
      }

      if (config.password !== config.passwordConfirm) {
        throw new Error('The two passwords entered do not match');
      }

      if (!this.currentUser) {
        throw new Error('Not signed in');
      }

      if (!this.currentUser.email) {
        throw new Error('Current user has not authenticated by Email before');
      }

      await this.reAuthenticate(config.currentPassword);

      await this.currentUser.updatePassword(config.password);

      return true;
    } catch(err) {
      console.error('Failed to change password', err, config);
      throw err;
    }
  }
}

export interface FirebaseChangePasswordConfig {
  password: string;
  passwordConfirm: string;
  currentPassword: string;
}