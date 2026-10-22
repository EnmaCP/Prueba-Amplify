import { FestivalEvent, EventStatus } from './data';

// URL del backend Express con DynamoDB
// Si pruebas en el navegador web: http://localhost:3000
// Si pruebas desde un móvil físico en la misma red Wi-Fi: cambia 'localhost' por la IP de tu PC (ej: 192.168.1.XX)
export const API_BASE_URL = 'http://localhost:3000/api/events';

export const eventsApi = {
  // Obtener todos los eventos desde DynamoDB
  async getAll(): Promise<FestivalEvent[]> {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Error al cargar eventos');
    return res.json();
  },

  // Crear un nuevo evento
  async create(event: Omit<FestivalEvent, 'id'> & { id?: string }): Promise<FestivalEvent> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error('Error al crear el evento');
    return res.json();
  },

  // Actualizar un evento existente
  async update(id: string, event: Partial<FestivalEvent>): Promise<FestivalEvent> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error('Error al actualizar el evento');
    return res.json();
  },

  // Cambiar el estado del evento
  async updateStatus(id: string, status: EventStatus): Promise<FestivalEvent> {
    const res = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Error al cambiar el estado');
    return res.json();
  },

  // Eliminar un evento
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar el evento');
  },
};

