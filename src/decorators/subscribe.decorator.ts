import { EventExplorerService } from '../constants';

export function Subscribe(queueName: string): MethodDecorator {
  const service = EventExplorerService;
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const TargetCtor = target.constructor;
    const instance = new TargetCtor();

    const handler = descriptor.value.bind(instance);
    service.subscribe(queueName, handler);

    return instance;
  }
}
