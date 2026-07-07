import { createClient } from '@butterbase/sdk'

// The Butterbase client. appId + apiUrl are public (safe in the browser bundle).
// Sessions are persisted to localStorage and restored on refresh by the SDK.
export const butterbase = createClient({
  appId: import.meta.env.VITE_APP_ID,
  apiUrl: import.meta.env.VITE_API_URL,
})
