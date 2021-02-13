# Simple PoC of pubsub http long polling instead of GRPC stream


## Example of usage

```typescript

const bootstrap = async () => {
    const api = new PubSubAPI()
    await api.init(process.env.PROJECT_ID, process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY)

    await api.push('test-topic', [{
        'key': 'value'
    }])

    const pubSubListener = new PubSubListener(api)

    pubSubListener.on('test-topic-sub', async (message: PubSubMessage): Promise<void> => {
        message.acknowledge()
    })

    await pubSubListener.listen(1000)
}

bootstrap()

```
