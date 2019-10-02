// tslint:disable-next-line: no-import-side-effect
import * as Firebase from 'firebase/app';

// tslint:disable-next-line: no-import-side-effect
import 'firebase/auth';

import { FirebaseBase } from './firebase-base';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class FirebaseReAuthenticate extends FirebaseBase<FirebaseReAuthenticateConfig> {
  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: FirebaseReAuthenticateConfig): Promise<any> {
    try {
      if (!this.currentUser) {
        throw new Error('Not signed in');
      }

      if (!this.currentProfiles.hasOwnProperty(config.providerId)) {
        throw new Error(`User has not used '${config.providerId}' to sign-in before`);
      }

      let userCredential: Firebase.auth.UserCredential | undefined;
      if (config.providerId === 'password') {
        if (!this.currentUser.email || !config.password) {
          throw new Error('A password must be provided when re-authenticating with an email and password');
        }
        const authCredential = Firebase.auth.EmailAuthProvider.credential(this.currentUser.email, config.password);
        userCredential = await this.currentUser.reauthenticateWithCredential(authCredential);
        if (!userCredential || !userCredential.user) {
          throw new Error('Failed to re-authenticate user by email and password');
        }
      } else {
        if (!this.providers.hasOwnProperty(config.providerId)) {
          throw new Error('The current provider for the authenticated user is not in the available provider list. This should not be able to happen');
        }
        const currentProvider = this.providers[config.providerId].provider;
        userCredential = await this.currentUser.reauthenticateWithPopup(currentProvider);
        if (!userCredential || !userCredential.user) {
          throw new Error(`Failed to re-authenticate user by provider ${config.providerId}`);
        }
      }

      return userCredential;
    } catch(err) {
      console.error('Failed to re-authenticate',  err, config);
      throw err;
    }
  }
}

export interface FirebaseReAuthenticateConfig {
  providerId: string;
  password?: string;
}