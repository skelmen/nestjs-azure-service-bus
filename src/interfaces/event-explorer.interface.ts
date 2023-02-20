export interface IEventExplorer {
  invoke<T>(message: string, data: T): void;
  subscribe(message: string, handler: Function): void;
}
