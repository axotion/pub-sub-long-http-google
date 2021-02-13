export class PubSubMessage {
    
    private acknowledged = false

    constructor(
        private ackId: string, 
        private payload :any, 
        private subscriptionName: string
    ) {}

    acknowledge() : void {
        this.acknowledged = true
    }

    isAcknowledged() : boolean {
        return this.acknowledged
    }

    getAckId() : string {
        return this.ackId
    }

    getSubscriptionName() : string {
        return this.subscriptionName
    }

    getPayload() : any {
        return this.payload
    }
}