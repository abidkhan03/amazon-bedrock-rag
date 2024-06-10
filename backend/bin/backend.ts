#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PoolChatbotStack } from '../lib/pool-chatbot-stack';

const app = new cdk.App();
new PoolChatbotStack(app, 'PoolChatbotStack', {
  env: { account: '395929101814', region: 'us-east-1' },
});