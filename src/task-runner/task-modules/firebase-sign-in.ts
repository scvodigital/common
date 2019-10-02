import * as Firebase from 'firebase/app';
// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseSignIn extends FirebaseBase<FirebaseSignInConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseSignInConfig): Promise<any> {
    try {
      await this.sessionCleanUp();

      if (!this.providers.hasOwnProperty(config.providerId)) {
        throw new Error(`Unknown provider '${config.providerId}'`);
      }

      console.log('Finding Provider', config.providerId, 'in', this.providers);
      const provider = this.providers[config.providerId].provider;
      let userCredential: Firebase.auth.UserCredential | undefined;

      console.log('Signing in with', provider);
      if (config.providerId === 'password') {
        if (!config.email || !config.password) {
          throw new Error('You must enter both an email and password');
        }
        userCredential = await this.app.auth().signInWithEmailAndPassword(config.email, config.password);
      } else {
        if (config.useRedirect) {
          await this.app.auth().signInWithRedirect(provider);
        } else {
          userCredential = await this.app.auth().signInWithPopup(provider);
        }
      }

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

export interface FirebaseSignInConfig {
  useRedirect?: boolean;
  email?: string;
  password?: string;
  providerId: string;
}