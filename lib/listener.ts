import { PubSubAPI } from "./api/pub-sub.api"
import { PubSubMessage } from "./model/pub-sub-message.model"
import { CallbackFunction } from "./types"

export class PubSubListener {

    private readonly listeners : Map<string, CallbackFunction>

    constructor(private pubsubAPI: PubSubAPI) {
        this.listeners = new Map<string, CallbackFunction>()
    }

    on(subscriptionName: string, callbackFunction: CallbackFunction) {
        this.listeners.set(subscriptionName, callbackFunction)
    }

    async listen(everyMilliseconds: number) {

        for(const [subscriptionName, listener] of this.listeners) {
            
            const pullCoroutine = async (everyMilliseconds: number) => {

                while(true) {

                    const rawMessages = await this.pubsubAPI.pull(subscriptionName)

                    // Continue pooling if there are no new messages
                    if(!rawMessages?.receivedMessages || rawMessages?.receivedMessages?.length === 0) {
                        continue;
                    }

                    await Promise.all(rawMessages.receivedMessages.map(async receivedMessage => {

                        const decodedBase64Message = Buffer.from(receivedMessage.message.data, 'base64')
                        const pubSubMessage = new PubSubMessage(receivedMessage.ackId, JSON.parse(decodedBase64Message.toString()), subscriptionName)
                        await listener(pubSubMessage)

                        if(pubSubMessage.isAcknowledged()) {
                            await this.pubsubAPI.acknowledge(pubSubMessage.getAckId(), subscriptionName)
                        }
                    }))

                    await new Promise(resolve => setTimeout(resolve, everyMilliseconds))
                }
            }
        
            pullCoroutine(everyMilliseconds)
        }
    }
}