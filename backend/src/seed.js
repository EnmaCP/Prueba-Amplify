import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './db.js';
import { ensureTableExists } from './initTable.js';

const initialEvents = [
  { id: 'EVT-101', artist: 'NEON WAVES', space: 'MAIN STAGE', time: '22:30', status: 'CONFIRMED' },
  { id: 'EVT-102', artist: 'MIDNIGHT SESSION', space: 'GARDEN', time: '23:15', status: 'DELAYED' },
  { id: 'EVT-103', artist: 'ELECTRIC SUNSET', space: 'MAIN STAGE', time: '20:15', status: 'CONFIRMED' },
  { id: 'EVT-104', artist: 'BASS THEORY', space: 'WAREHOUSE', time: '00:30', status: 'CONFIRMED' },
];

export async function seedEvents() {
  await ensureTableExists();
  console.log(`[Seed] Insertando datos iniciales en la tabla "${TABLE_NAME}"...`);

  for (const event of initialEvents) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...event,
          createdAt: new Date().toISOString(),
        },
      })
    );
    console.log(`  ✔ Insertado: ${event.id} - ${event.artist}`);
  }

  console.log('[Seed] ¡Datos iniciales cargados con éxito!');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedEvents()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error al insertar datos:', err);
      process.exit(1);
    });
}

