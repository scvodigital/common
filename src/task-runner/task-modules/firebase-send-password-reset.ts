// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseSendPasswordReset extends FirebaseBase<FirebaseSendPasswordResetConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseSendPasswordResetConfig): Promise<any> {
    try {
      console.log('Requesting password reset email for', config.email);
      await this.app.auth().sendPasswordResetEmail(config.email);
      return true;
    } catch(err) {
      console.error('Failed to request password reset email', err, config);
      throw err;
    }
  }
}

export interface FirebaseSendPasswordResetConfig {
  email: string;
}