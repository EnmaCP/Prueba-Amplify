import {
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from './db.js';

export async function ensureTableExists() {
  try {
    const describe = new DescribeTableCommand({ TableName: TABLE_NAME });
    await dynamoClient.send(describe);
    console.log(`[DynamoDB] La tabla "${TABLE_NAME}" ya existe.`);
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`[DynamoDB] Creando tabla "${TABLE_NAME}" con clave primaria 'id'...`);
      const createCommand = new CreateTableCommand({
        TableName: TABLE_NAME,
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH', // Partition Key
          },
        ],
        BillingMode: 'PAY_PER_REQUEST', // Sin costes fijos, ideal para proyectos serverless
      });

      await dynamoClient.send(createCommand);
      console.log(`[DynamoDB] Esperando a que la tabla "${TABLE_NAME}" esté activa...`);
      await waitUntilTableExists(
        { client: dynamoClient, maxWaitTime: 60 },
        { TableName: TABLE_NAME }
      );
      console.log(`[DynamoDB] ¡Tabla "${TABLE_NAME}" creada y lista para usar!`);
      return true;
    } else {
      console.error('[DynamoDB] Error al verificar/crear la tabla:', err.message);
      throw err;
    }
  }
}

// Ejecución directa si se llama por línea de comandos: `npm run init-table`
if (process.argv[1]?.endsWith('initTable.js')) {
  ensureTableExists()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

