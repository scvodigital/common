// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseDeleteUser extends FirebaseBase<any> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: any): Promise<any> {
    try {
      if (!this.currentUser) {
        throw new Error('Not signed in');
      }

      await this.currentUser.delete();

      await this.sessionCleanUp();

      return true;
    } catch(err) {
      console.error('Failed to unlink provider', err, config);
      throw err;
    }
  }
}