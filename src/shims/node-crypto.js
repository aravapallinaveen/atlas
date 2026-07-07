// Browser shim for the sliver of `node:crypto` that the Butterbase SDK's shared
// quota module imports. Modern browsers provide Web Crypto with randomUUID().
const webcrypto = globalThis.crypto

export const randomUUID = () =>
  webcrypto && typeof webcrypto.randomUUID === 'function'
    ? webcrypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })

export default { randomUUID }
