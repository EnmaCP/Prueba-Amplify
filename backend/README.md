# Backend Festival Control con AWS DynamoDB

Backend desarrollado con **Node.js + Express** y el **AWS SDK v3** (`@aws-sdk/client-dynamodb` y `@aws-sdk/lib-dynamodb`) para conectar la aplicación Festival Control con **Amazon DynamoDB**.

---

## 🚀 Instalación y arranque

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura tus credenciales en el archivo `.env`:
   - Copia `.env.example` a `.env` (si aún no lo has hecho).
   - Abre `.env` y añade tus credenciales de AWS.

4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   El servidor arrancará en `http://localhost:3000`.

---

## 🔑 Configuración de credenciales de AWS

### Caso A: AWS Academy / Learner Lab
En los laboratorios de AWS Academy las credenciales caducan periódicamente y requieren un `session_token`:
1. En la consola de AWS Academy, pulsa en **AWS Details**.
2. Copia el bloque de `AWS CLI / Environment variables`.
3. Pega los valores en tu archivo `backend/.env`:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=ASI...
   AWS_SECRET_ACCESS_KEY=...
   AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjE...
   ```

### Caso B: Cuenta propia de AWS (IAM User)
Crea un usuario IAM con permisos para DynamoDB (`AmazonDynamoDBFullAccess` o política personalizada):
```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### Caso C: DynamoDB Local (sin cuenta de AWS)
Puedes ejecutar DynamoDB en tu ordenador usando Docker:
```bash
docker run -p 8000:8000 amazon/dynamodb-local
```
Y en tu `.env` descomenta:
```env
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=fakeKeyId
AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey
```

---

## 📦 Inicializar la tabla y datos de prueba

- Para crear automáticamente la tabla `FestivalEvents` en DynamoDB:
  ```bash
  npm run init-table
  ```
- Para rellenar la tabla con los eventos iniciales de ejemplo:
  ```bash
  npm run seed
  ```

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción | Body (JSON) |
|---|---|---|---|
| `GET` | `/health` | Estado del backend | - |
| `GET` | `/api/events` | Listar todos los eventos | Parámetros opcionales: `?space=MAIN STAGE` o `?search=neon` |
| `GET` | `/api/events/:id` | Obtener evento por ID | - |
| `POST` | `/api/events` | Crear un nuevo evento | `{ "artist": "NAME", "space": "STAGE", "time": "22:00", "status": "CONFIRMED" }` |
| `PUT` | `/api/events/:id` | Modificar un evento | `{ "artist": "NAME", "space": "STAGE", "time": "22:00", "status": "DELAYED" }` |
| `PATCH` | `/api/events/:id/status` | Cambiar solo el estado | `{ "status": "DELAYED" }` |
| `DELETE` | `/api/events/:id` | Eliminar un evento | - |
| `POST` | `/api/seed` | Cargar eventos de prueba | - |

