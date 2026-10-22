import { Router } from 'express';
import {
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../db.js';

const router = Router();

// GET /api/events - Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const { space, search } = req.query;
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const result = await docClient.send(command);
    let items = result.Items || [];

    // Filtros opcionales en memoria
    if (space && space !== 'TODOS') {
      items = items.filter((item) => item.space === space);
    }
    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(
        (item) =>
          item.artist?.toLowerCase().includes(q) ||
          item.id?.toLowerCase().includes(q)
      );
    }

    res.json(items);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      error: 'Error al obtener eventos desde DynamoDB',
      details: error.message,
    });
  }
});

// GET /api/events/:id - Obtener un evento específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    const result = await docClient.send(command);
    if (!result.Item) {
      return res.status(404).json({ error: `Evento con ID ${id} no encontrado` });
    }

    res.json(result.Item);
  } catch (error) {
    console.error(`Error al obtener evento ${id}:`, error);
    res.status(500).json({
      error: 'Error al consultar DynamoDB',
      details: error.message,
    });
  }
});

// POST /api/events - Crear un nuevo evento
router.post('/', async (req, res) => {
  try {
    const { id, artist, space, time, status } = req.body;

    if (!artist || !time) {
      return res.status(400).json({
        error: 'Los campos "artist" y "time" son obligatorios.',
      });
    }

    const newEvent = {
      id: id || `EVT-${Date.now().toString().slice(-7)}`,
      artist: String(artist).trim().toUpperCase(),
      space: space || 'MAIN STAGE',
      time: String(time).trim(),
      status: status || 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: newEvent,
    });

    await docClient.send(command);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({
      error: 'Error al guardar en DynamoDB',
      details: error.message,
    });
  }
});

// PUT /api/events/:id - Actualizar evento completo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { artist, space, time, status } = req.body;

  try {
    const updatedEvent = {
      id,
      artist: String(artist).trim().toUpperCase(),
      space: space || 'MAIN STAGE',
      time: String(time).trim(),
      status: status || 'CONFIRMED',
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedEvent,
    });

    await docClient.send(command);
    res.json(updatedEvent);
  } catch (error) {
    console.error(`Error al actualizar evento ${id}:`, error);
    res.status(500).json({
      error: 'Error al actualizar en DynamoDB',
      details: error.message,
    });
  }
});

// PATCH /api/events/:id/status - Cambiar sólo el estado del evento
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['CONFIRMED', 'DELAYED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #st = :status, #ua = :updatedAt',
      ExpressionAttributeNames: {
        '#st': 'status', // 'status' puede ser palabra reservada en DynamoDB
        '#ua': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    res.json(result.Attributes);
  } catch (error) {
    console.error(`Error al actualizar estado de ${id}:`, error);
    res.status(500).json({
      error: 'Error al actualizar estado en DynamoDB',
      details: error.message,
    });
  }
});

// DELETE /api/events/:id - Eliminar evento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    await docClient.send(command);
    res.json({ message: `Evento ${id} eliminado correctamente`, id });
  } catch (error) {
    console.error(`Error al eliminar evento ${id}:`, error);
    res.status(500).json({
      error: 'Error al eliminar en DynamoDB',
      details: error.message,
    });
  }
});

export default router;

