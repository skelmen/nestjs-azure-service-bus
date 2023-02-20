import { IEventExplorer } from '../interfaces';

export class EventExplorer implements IEventExplorer {
  private subscriptions = new Map<string, Function>();

  invoke<T>(message: string, payload: T): void {
    const handler = this.subscriptions.get(message);
    handler(payload);
  }

  subscribe(message: string, handler: Function): void {
    this.subscriptions.set(message, handler);
  }
}
