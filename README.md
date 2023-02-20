<p align="center">
<a href="https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview" target="_blank">Azure Service Bus</a> module for <a href="https://nestjs.com" target="_blank">Nest.js framework</a></p>
<p align="center">
<a href="https://www.npmjs.com/~skelmen" target="_blank"><img src="https://img.shields.io/npm/v/@skelmen/nestjs-azure-service-bus-module.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~skelmen" target="_blank"><img src="https://img.shields.io/npm/l/@skelmen/nestjs-azure-service-bus-module.svg" alt="Package License" /></a>
</p>

## Description

Azure Service Bus module for Nest.js based on the @azure/service-bus package.

## Installation

```bash
$ npm i --save @skelmen/nestjs-azure-service-bus-module
```

## Usage

For messages scheduling pass `updateTime` param to `emit` method.

#### Import module

```ts
AzureServiceBusModule.forRootAsync([
  {
    name: 'provider_name_1',
    useFactory: (configService: ConfigService) => ({
      connectionString: configService.get('connectionString1'),
      options: {} // Azure service bus client options
    }),
    inject: [ConfigService],
  },
  {
    name: 'provider_name_2',
    useFactory: () => ({
      connectionString: 'connectionString2',
      options: {} // Azure service bus client options
    }),
    inject: [],
  },
]),
```

#### Service example

```ts
@Injectable()
export class AppService {

  constructor(
    @Inject('provider_name_1') private readonly serviceBusClient: AzureServiceBusClient,
  ) { }

  getData(){
    const options = {}; // Azure options for configuring tracing and the abortSignal
    const payload = {
      body: {
        id: '39219'
      }
    };
    this.serviceBusClient.emit({ payload, options, updateTime });
  }

  scheduleData(){
    const options = {};
    const payload = {
      body: {
        id: '39219'
      }
    };
    // (Optional) For scheduling messages
    const updateTime = new Date('2023-02-20 13:26:00+02');
    this.serviceBusClient.emit({ payload, options, updateTime });
  }
}
```

#### Handle events

```ts
@Subscribe('service-bus-queue-name')
async handler(data) {
  console.log(">>>>>", data)
}
```

## License
This project is licensed under the [MIT License](LICENSE.md)
