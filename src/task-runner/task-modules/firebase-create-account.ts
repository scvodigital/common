// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseCreateAccount extends FirebaseBase<FirebaseCreateAccountConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseCreateAccountConfig): Promise<any> {
    try {
      await this.sessionCleanUp();

      if (config.email.toLowerCase() !== config.emailConfirm.toLowerCase()) {
        throw new Error('The two email addresses entered do not match');
      }

      if (config.password !== config.passwordConfirm) {
        throw new Error('The two passwords entered do not match');
      }

      console.log('Creating user with email', config.email);
      const userCredential = await this.app.auth().createUserWithEmailAndPassword(config.email, config.password);

      if (!userCredential) {
        throw new Error('Something went wrong, signed in but no user?');
      }

      const user = await this.initialiseSession(userCredential);
      return user;
    } catch(err) {
      console.error('Failed to create account', err, config);
      throw err;
    }
  }
}

export interface FirebaseCreateAccountConfig {
  email: string;
  emailConfirm: string;
  password: string;
  passwordConfirm: string;
  disabled:  boolean;
}