// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseGetUser extends FirebaseBase<any> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: any): Promise<any> {
    return this.currentUser;
  }
}