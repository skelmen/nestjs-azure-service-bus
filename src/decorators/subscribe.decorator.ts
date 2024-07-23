import { SetMetadata } from '@nestjs/common';
import { AZURE_SERVICE_BUS_CONSUMER_METHOD } from '../constants';

export const Subscribe = (name: string) => SetMetadata(AZURE_SERVICE_BUS_CONSUMER_METHOD, { name });