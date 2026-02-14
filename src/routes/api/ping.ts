import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { gatewayConnectCheck, gatewayReconnect } from '../../server/gateway'

export const Route = createFileRoute('/api/ping')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await gatewayConnectCheck()
          return json({ ok: true })
        } catch (firstErr) {
          // If first attempt fails, try a fresh reconnect
          // (handles case where env vars were updated but singleton is stale)
          try {
            await gatewayReconnect()
            return json({ ok: true })
          } catch (retryErr) {
            return json(
              {
                ok: false,
                error: retryErr instanceof Error ? retryErr.message : String(retryErr),
              },
              { status: 503 },
            )
          }
        }
      },
    },
  },
})
