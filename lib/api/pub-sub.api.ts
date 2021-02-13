import { PUB_SUB_URL } from "../constants";
import { Compute, GoogleAuth, JWT, UserRefreshClient } from 'google-auth-library';

export class PubSubAPI {

    private client: Compute | JWT | UserRefreshClient;

    private projectId: string;

    async init(projectId: string, clientEmail: string, privateKey: string) {

        this.projectId = projectId

        const auth = new GoogleAuth({
            projectId: projectId,
            scopes: ['https://www.googleapis.com/auth/pubsub'],
            credentials: {
                client_email: clientEmail,
                private_key: privateKey
            }
        });

        this.client = await auth.getClient()
    }

    async push(topic: string, messages: any[]) {

        const requestMessages = JSON.stringify({
                messages: [
                    {
                        data: messages.map(message => {
                          return new Buffer(JSON.stringify(message)).toString('base64')
                        })
                    }
                ]
        })

        await this.client.request({
            method: 'POST',
            url: `${PUB_SUB_URL}/v1/projects/${this.projectId}/topics/${topic}:publish`,
            data: requestMessages
        })
    }

    async pull(subscriptionName: string) : Promise<any> {

        const response = this.client.request({
            data: JSON.stringify({max_messages: 10}),
            method: 'POST',
            url: `${PUB_SUB_URL}/v1/projects/${this.projectId}/subscriptions/${subscriptionName}:pull`
        })
       
        return (await response).data
    }

    async acknowledge(ackId: string, subscriptionName: string) : Promise<void> {

        await this.client.request({
            data: JSON.stringify({"ackIds": [ackId]}),
            method: 'POST',
            url: `${PUB_SUB_URL}/v1/projects/${this.projectId}/subscriptions/${subscriptionName}:acknowledge`
        })
    }
}
