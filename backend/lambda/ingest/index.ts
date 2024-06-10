
import { BedrockAgentClient, StartIngestionJobCommand } from '@aws-sdk/client-bedrock-agent';
import { Handler, Context } from 'aws-lambda';

const client = new BedrockAgentClient({ region: process.env.REGION });

export const handler: Handler = async (event: any, context: any) => {
    const input = {
        knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
        dataSourceId: process.env.DATA_SOURCE_ID,
        clientToken: context.awsRequestId,
    }
    try {
        const command = new StartIngestionJobCommand(input);
        const response = await client.send(command);
        console.log(response);
        return JSON.stringify({
            ingestionJob: response.ingestionJob,
        })

    } catch (err) {
        console.log(err);
    }
}