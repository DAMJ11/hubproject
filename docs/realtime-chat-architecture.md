---

# Guía detallada: Configuración de variables de entorno para Pusher

> Esta guía te ayudará a crear tu app en Pusher, obtener las credenciales y configurar correctamente las variables de entorno en tu proyecto para desarrollo y producción.

## 1. Crear cuenta y app en Pusher

1. Ve a https://dashboard.pusher.com/
2. Regístrate o inicia sesión.
3. Haz clic en el recuadro de **Channels**.
4. Haz clic en “Get started” o “Create app”.
5. Completa los datos:
  - **App name:** Ponle un nombre (ejemplo: ManufyChat).
  - **Cluster:** Elige la región más cercana a tus usuarios (ej: us2, eu, etc.).
  - **Tech stack:** Selecciona “JavaScript” o “Node.js”.
6. Haz clic en “Create app”.

## 2. Obtener las credenciales de tu app

1. Dentro de tu app, ve a la sección **App Keys** o **Credentials**.
2. Copia los siguientes valores:
  - **App ID**
  - **Key**
  - **Secret**
  - **Cluster**

## 3. Configurar el archivo `.env.local` (desarrollo)

1. Abre o crea el archivo `.env.local` en la raíz del proyecto.
2. Pega y completa con tus valores:

  ```env
  NEXT_PUBLIC_PUSHER_KEY=tu_key_publica
  NEXT_PUBLIC_PUSHER_CLUSTER=tu_cluster

  PUSHER_KEY=tu_key_publica
  PUSHER_SECRET=tu_secret
  PUSHER_APP_ID=tu_app_id
  PUSHER_CLUSTER=tu_cluster
  ```

3. Ejemplo real (no usar en producción):

  ```env
  NEXT_PUBLIC_PUSHER_KEY=d9ddfa57c92d523f5a1c
  NEXT_PUBLIC_PUSHER_CLUSTER=us2

  PUSHER_KEY=d9ddfa57c92d523f5a1c
  PUSHER_SECRET=3ff6cc8b956964190d77
  PUSHER_APP_ID=2126533
  PUSHER_CLUSTER=us2
  ```

## 4. Configurar el archivo `.env.production` (producción)

- Repite el paso anterior, pero usando las credenciales de la app de producción (si tienes una distinta) y nómbralo `.env.production`.
- **Nunca subas estos archivos a GitHub.**

## 5. Reiniciar el servidor

- Guarda los cambios.
- Detén y vuelve a iniciar tu servidor de desarrollo para que tome las nuevas variables.

## 6. Verificar funcionamiento

- Envía un mensaje de prueba en la app.
- Si todo está bien, los mensajes llegarán en tiempo real y no verás errores de Pusher en consola.
- Si hay errores, revisa:
  - Que las variables estén bien copiadas.
  - Que el cluster coincida.
  - Que no haya espacios extra o comillas en los valores.

## 7. Cambiar o rotar credenciales

- Si necesitas cambiar las claves (por seguridad o despliegue):
  1. Ve al panel de Pusher y genera nuevas credenciales.
  2. Actualiza los valores en `.env.local` y/o `.env.production`.
  3. Reinicia el servidor.

## 8. Seguridad y buenas prácticas

- **Nunca** subas tus archivos `.env` a ningún repositorio público.
- Usa `.env.example` para documentar las variables requeridas (sin valores reales).
- Cambia las claves si sospechas que han sido expuestas.

---

¿Dudas? Consulta la documentación oficial de Pusher: https://pusher.com/docs/channels/getting_started/
# Realtime Messaging: Arquitectura y Buenas Practicas

Fecha: 2026-03-11

## Objetivo
Implementar actualizacion de mensajes no leidos y conversaciones en tiempo real con enfoque enterprise: seguridad por canal, bajo costo operativo, resiliencia y trazabilidad.

## Estado actual
- Fase 1: completada (badge dinamico + sync multi-pestana + fallback polling).
- Fase 2: completada con proveedor realtime gestionado (Pusher).

## Que se implemento en Fase 2

### 1) Infraestructura realtime gestionada
- Se agrego Pusher para publicacion/consumo de eventos.
- Se mantiene el fallback de polling para resiliencia.

### 2) Canales privados con autorizacion fuerte
- Canal por usuario: `private-user-{userId}`
- Canal por conversacion: `private-conversation-{conversationId}`
- Endpoint de auth privado: `POST /api/realtime/auth`
  - Valida sesion activa.
  - Valida pertenencia del usuario al canal solicitado.
  - Deniega acceso a canales no autorizados.

### 3) Publicacion de eventos de dominio desde backend
Se emiten eventos al crear mensajes, leer mensajes y cambiar estado de conversaciones:
- `chat.message.created`
- `chat.messages.read`
- `chat.conversation.updated`
- `chat.unread.updated`

Estos eventos se publican tanto al canal de conversacion como a los canales privados de usuarios participantes.

### 4) Suscripcion realtime en frontend
- `useUnreadMessagesCount` se suscribe al canal privado del usuario para refrescar contador sin esperar polling.
- `MessagesPanel` se suscribe a:
  - canal privado del usuario (actualizacion de lista de conversaciones y badges)
  - canal privado de conversacion activa (nuevos mensajes / cambios de estado)

### 5) Compatibilidad y degradacion controlada
- Si faltan variables de entorno de Pusher, la app sigue funcionando con polling/eventos locales.
- No se rompe funcionalidad base de mensajeria.

## Archivos creados/modificados

### Nuevos
- `src/lib/realtime/pusherServer.ts`
- `src/lib/realtime/notifyConversation.ts`
- `src/lib/realtime/pusherClient.ts`
- `src/app/api/realtime/auth/route.ts`

### Actualizados
- `src/hooks/useUnreadMessagesCount.ts`
- `src/components/dashboard/Sidebar.tsx`
- `src/components/dashboard/MessagesPanel.tsx`
- `src/app/api/conversations/[id]/messages/route.ts`
- `src/app/api/conversations/[id]/respond/route.ts`
- `src/app/api/conversations/route.ts`

## Variables de entorno requeridas

Definir en el entorno del proyecto:

```env
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_public_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

Notas:
- `NEXT_PUBLIC_*` se expone al cliente.
- `PUSHER_SECRET` nunca debe exponerse en frontend.

## Dependencias incorporadas
- `pusher`
- `pusher-js`

## Flujo operativo (mensaje nuevo)
1. Cliente envia mensaje via API REST.
2. Backend persiste en DB.
3. Backend actualiza `last_message_at`.
4. Backend publica eventos realtime a participantes.
5. Clientes suscritos actualizan UI en tiempo real.
6. Polling queda como red de seguridad.

## Seguridad aplicada
- Auth por cookie de sesion en endpoint de autorizacion de canales.
- Autorizacion por ownership/membership de conversacion.
- Canales privados por recurso (usuario/conversacion).
- Rechazo explicito para accesos no autorizados.

## Sostenibilidad e ingenieria
- Se evita operar WebSocket propio multi-instancia en esta etapa.
- Se reduce complejidad de infraestructura con proveedor gestionado.
- Se mantiene fallback para continuidad operativa.
- Se centraliza emision de eventos (`notifyConversationParticipants`) para evitar duplicacion y mejorar mantenibilidad.

## Criterios de aceptacion cubiertos
- El badge de "Mensajes" ya no usa numeros hardcodeados.
- Si no hay no leidos, no se renderiza badge.
- Cambios de chat impactan UI en tiempo real.
- Sincronizacion entre pestañas del mismo navegador.
- Fallback funcional cuando realtime no esta configurado.

## Checklist de despliegue
1. Configurar variables de entorno de Pusher en todos los entornos.
2. Desplegar backend y frontend con nuevas dependencias.
3. Validar auth de canales con usuario autorizado y no autorizado.
4. Probar flujo de mensaje entre dos cuentas diferentes.
5. Verificar que el badge desaparece cuando unread = 0.
6. Confirmar fallback de polling al desactivar variables realtime.
