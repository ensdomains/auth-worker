import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'
import { fetchDentityFederatedToken } from './fetchDentityFederatedToken.js'
import { setupServer } from 'msw/node'
import { http, HttpResponse} from 'msw'

const restHandlers = [
  http.post('https://example.com/oidc/token', () => {
    return HttpResponse.json({ 
      "access_token": "access-token",
      "expires_in": 86400,
      "id_token": "id-token",
      "scope": "openid federated_token",
      "token_type": "Bearer",
      "federated_token": "federated-token",
      "ens_name": "name.eth",
      "eth_address": "0xaddress"
   })
  }),
]

const server = setupServer(...restHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterAll(() => server.close())

afterEach(() => server.resetHandlers())

test('works', async () => {
  const request = new Request('http://localhost/v1/example', { body: JSON.stringify({ code: 'test-code' }), method: 'POST' })
  const response = await fetchDentityFederatedToken(request, { env: {
    DENTITY_CLIENT_ID: 'test-client-id',
    DENTITY_CLIENT_SECRET: 'test-client-secret',
    DENTITY_BASE_ENDPOINT: 'https://example.com',
    APP_REDIRECT: 'https://example.com',
  }, ctx: {} as ExecutionContext })
  expect(response.status).toBe(200)
  // expect(response.headers.get('Content-Type')).toMatchInlineSnapshot(`"application/json; charset=utf-8"`)
  expect(await response.json()).toEqual({ name: 'name.eth', address: '0xaddress', token: 'federated-token' })
})
