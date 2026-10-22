import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

export const TABLE_NAME = process.env.TABLE_NAME || 'FestivalEvents';
const region = process.env.AWS_REGION || 'us-east-1';

const clientConfig = {
  region,
};

// Si se define un endpoint personalizado (ej: DynamoDB Local con Docker)
if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

// Si se configuran credenciales en el archivo .env (útil para AWS Academy / Learner Lab)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    ...(process.env.AWS_SESSION_TOKEN && {
      sessionToken: process.env.AWS_SESSION_TOKEN,
    }),
  };
}

export const dynamoClient = new DynamoDBClient(clientConfig);

// DocumentClient simplifica el trabajo con objetos JSON nativos
export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

