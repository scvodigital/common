import * as Firebase from 'firebase/app';
// tslint:disable: no-import-side-effect
import 'firebase/auth';
import 'firebase/database';
// tslint:enable: no-import-side-effect

import { Basic } from './basic';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

declare global {
  interface Window {
    firebaseTaskConfig: FirebaseTaskConfig;
  }
}

export class FirebaseProvider {
  constructor(public label: string, public provider: Firebase.auth.AuthProvider, public scopes?: string[]) {
    if (scopes && provider.hasOwnProperty('addScope')) {
      scopes.forEach(function(scope) {
        (provider as any).addScope(scope);
      });
    }
  }
}

export abstract class FirebaseBase<T> extends Basic<any> {
  get app(): Firebase.app.App {
    return Firebase.app();
  }

  get currentUser(): Firebase.User | null {
    return Firebase.auth().currentUser;
  }

  get upgradeTokenUrl(): string {
    return window.firebaseTaskConfig.upgradeTokenUrl || '/upgrade-token?token={idToken}';
  }

  get cookieName(): string {
    return window.firebaseTaskConfig.cookieName || 'fb-auth';
  }

  get providers(): { [providerName: string]: FirebaseProvider } {
    return {
      'google.com': new FirebaseProvider('Google', new Firebase.auth.GoogleAuthProvider(), ['email']),
      'facebook.com': new FirebaseProvider('Facebook', new Firebase.auth.FacebookAuthProvider, ['email']),
      'twitter.com': new FirebaseProvider('Twitter', new Firebase.auth.TwitterAuthProvider()),
      'github.com': new FirebaseProvider('Github', new Firebase.auth.GithubAuthProvider(), ['user:email']),
      'password': new FirebaseProvider('Email and password', new Firebase.auth.EmailAuthProvider())
    }
  }

  get currentProfiles(): { [providerId: string]: FirebaseProfile } {
    const profiles: { [providerId: string]: FirebaseProfile } = {};

    if (this.currentUser) {
      for (const profile of this.currentUser.providerData) {
        if (profile) {
          profiles[profile.providerId] = {
            ...profile,
            provider: this.providers[profile.providerId]
          };
        }
      }
    }

    return profiles;
  }

  async sessionCleanUp() {
    try {
      console.log('Cleaning up any lingering sessions');
      if (this.currentUser) {
        await this.app.auth().signOut();
      }
    } catch(err) {
      console.error('Problem signing out in session clean up', err);
    }
    document.cookie = this.cookieName + '=; Max-Age=-99999999; path=/; secure';
    return true;
  }

  async initialiseSession(userCredential: Firebase.auth.UserCredential) {
    try {
      if (!userCredential.user) {
        throw Error('No user credentials');
      }

      console.log('Getting Id Token result for', userCredential);
      const idToken = await userCredential.user.getIdTokenResult();
      if (!idToken) {
        throw new Error('Failed to get Id Token');
      }

      console.log('Upgrading Id Token for Session Cookie', idToken);
      const user = await this.upgradeIdToken(idToken.token);
      if (!user) {
        throw new Error('Something went wrong upgrading id token');
      }

      console.log('All done and we have user', user);
      return user;
    } catch (err) {
      console.error('Failed to initialise session', err);
      throw err;
    }
  }

  upgradeIdToken(idToken: string) {
    return new Promise((resolve, reject) => {
      const url = this.upgradeTokenUrl.replace('{idToken}', idToken);
      console.log('About to ajax upgrade token', url);
      $.getJSON(url, (data, status, xhr) => {
        console.log('Request successful', url);
        resolve(data);
      }).fail((data, status, xhr) => {
        console.error('Failed request', url, status);
        reject(data);
      });
    });
  }

  async main(context: TaskRunnerContext, taskConfig: TaskConfig, config: any): Promise<any> {
    return null;
  }
}

export interface FirebaseTaskConfig {
  cookieName: string;
  upgradeTokenUrl: string;
}

export interface FirebaseProfile extends Firebase.UserInfo {
  provider: FirebaseProvider;
}