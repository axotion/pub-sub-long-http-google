import { PubSubMessage } from './model/pub-sub-message.model';
export type CallbackFunction = (message: PubSubMessage) => Promise<void>;

