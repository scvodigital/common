// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseSignInEmailPassword extends FirebaseBase<FirebaseSignInEmailPasswordConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseSignInEmailPasswordConfig): Promise<any> {
    try {
      await this.sessionCleanUp();

      console.log('Signing in as', config.email);
      const userCredential = await this.app.auth().signInWithEmailAndPassword(config.email, config.password);

      if (!userCredential) {
        throw new Error('Something went wrong, signed in but no user?');
      }

      const user = await this.initialiseSession(userCredential);
      return user;
    } catch(err) {
      console.error('Failed to sign in using email and password',  err, config);
      throw err;
    }
  }
}

export interface FirebaseSignInEmailPasswordConfig {
  email: string;
  password: string;
}