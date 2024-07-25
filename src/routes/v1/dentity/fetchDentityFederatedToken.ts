import { json } from "itty-router/json"

import type { RouteParameters } from "@/types.js"

export const fetchDentityFederatedToken = async (
  _request: Request,
  { env: _env, ctx: _ctx }: RouteParameters,
) => {
  const { DENTITY_CLIENT_ID, DENTITY_CLIENT_SECRET, DENTITY_BASE_ENDPOINT, APP_REDIRECT } = _env
  const { code } = (await _request.json()) as { code: string }

  const body = new URLSearchParams()
  body.append("client_id", DENTITY_CLIENT_ID)
  body.append("client_secret", DENTITY_CLIENT_SECRET)
  body.append("grant_type", "authorization_code")
  body.append("code", code)
  body.append("redirect_uri", APP_REDIRECT)

  const resp = await fetch(`${DENTITY_BASE_ENDPOINT}/oidc/token`, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  const data = await resp.json()
  return json(data)
}
