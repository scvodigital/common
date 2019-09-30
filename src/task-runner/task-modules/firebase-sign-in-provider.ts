// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseSignInProvider extends FirebaseBase<FirebaseSignInProviderConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseSignInProviderConfig): Promise<any> {
    try {
      await this.sessionCleanUp();

      console.log('Finding Provider', config.providerName, 'in', this.providers);
      const provider = this.providers[config.providerName].provider;

      console.log('Signing in with', provider);
      const userCredential = await this.app.auth().signInWithPopup(provider);

      if (!userCredential) {
        throw new Error('Something went wrong, signed in but no user?');
      }

      const user = await this.initialiseSession(userCredential);
      return user;
    } catch(err) {
      console.error('Failed to sign in using provider', err, config);
      throw err;
    }
  }
}

export interface FirebaseSignInProviderConfig {
  providerName: string;
}