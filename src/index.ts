import { Router, type IRequestStrict } from 'itty-router/Router'
import { createCors } from 'itty-router/createCors'
import { error } from 'itty-router/error'

import type { RouteParameters } from '@/types.js'

import { v1 } from '@routes/v1.js'
import { stripBodyForHeadRequest } from './utils/stripBodyForHeadRequest.js'

const { preflight, corsify } = createCors({
  origins: ['*'],
  methods: ['GET', 'HEAD', 'OPTIONS'],
})

const router = Router<IRequestStrict, [RouteParameters]>()

// Preflight
router.all('*', preflight)

// V1 Routes
router.post('/v1/dentity/token', v1.fetchDentityFederatedToken)
router.head('/v1/dentity/token', v1.fetchDentityFederatedToken)
router.options('/v1/dentity/token', () => new Response(null, { status: 204 }))

// 404 Fallback
router.all('*', () => error(404, 'Not Found'))

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) =>
    router
      .handle(request, { env, ctx })
      .then(stripBodyForHeadRequest(request))
      .catch((e: unknown) => {
        console.error(e)
        const errorMsg = e instanceof Error ? e.message : ''
        if (errorMsg) return error(400, errorMsg)
        return error(500, 'Internal Server Error')
      })
      .then(corsify),
}
