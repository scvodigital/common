import { Basic } from './basic';
import { TaskRunnerContext, TaskConfig } from '../task-runner';

export class Geolocation extends Basic<any> {
  main(context: TaskRunnerContext, taskConfig: TaskConfig, config: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
}