import {
    BedrockAgentRuntimeClient,
    RetrieveAndGenerateCommand,
    RetrieveAndGenerateCommandInput,
    RetrieveAndGenerateCommandOutput
} from "@aws-sdk/client-bedrock-agent-runtime";
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new BedrockAgentRuntimeClient({
    region: process.env.AWS_REGION,
});

interface HandlerEvent {
    question: string;
    requestSessionId: string;
}

const baseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { question, requestSessionId } = event.body as unknown as HandlerEvent;
    try {
        const input: RetrieveAndGenerateCommandInput = {
            sessionId: requestSessionId,
            input: {
                text: question,
            },
            retrieveAndGenerateConfiguration: {
                type: "KNOWLEDGE_BASE",
                knowledgeBaseConfiguration: {
                    knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
                    modelArn: `arn:aws:bedrock:${process.env.REGION}::foundation-model/anthropic.claude-instant-v1`,
                },
            },
        };

        const command = new RetrieveAndGenerateCommand(input);
        const response: RetrieveAndGenerateCommandOutput = await client.send(command);
        // const reference = response.citations?.[0]?.retrievedReferences?.[0]?.location.s3Location.uri;

        return makeResults(200, response.output?.text || '', response.sessionId || null);
    } catch (err) {
        console.error("Error sending command:", err);
        return makeResults(500, "Server side error: please check function logs", null);
    }
};

function makeResults(statusCode: number, responseText: string, responseSessionId: string | null): APIGatewayProxyResult {
    return {
        statusCode: statusCode,
        body: JSON.stringify({
            response: responseText,
            // citation: citationText,
            sessionId: responseSessionId
        }),
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    };
}

export const handler = middy()
    .use(httpJsonBodyParser())
    .use(httpHeaderNormalizer())
    .handler(baseHandler);