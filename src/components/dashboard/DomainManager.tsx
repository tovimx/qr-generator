'use client'

import { useEffect, useState } from 'react'

type Domain = {
  id: string
  hostname: string
  type: string
  verified: boolean
  primary: boolean
  createdAt: string
}

export default function DomainManager() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [hostname, setHostname] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    const res = await fetch('/api/domains', { cache: 'no-store' })
    if (!res.ok) {
      setError('Failed to load domains')
      return
    }
    const data = await res.json()
    setDomains(data.domains || [])
  }

  useEffect(() => {
    load()
  }, [])

  const addDomain = async () => {
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Failed to add domain')
      }
      setHostname('')
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add domain')
    } finally {
      setAdding(false)
    }
  }

  const setPrimary = async (id: string) => {
    setError(null)
    const res = await fetch(`/api/domains/${id}/primary`, { method: 'PATCH' })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j?.error || 'Failed to set primary')
      return
    }
    await load()
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Domains</h2>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Add a domain</label>
                <input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="e.g., client.yourapp.com or www.clientdomain.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                />
              </div>
              <button
                onClick={addDomain}
                disabled={adding || !hostname}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {adding ? 'Adding…' : 'Add Domain'}
              </button>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="border-t pt-4">
              {domains.length === 0 ? (
                <p className="text-sm text-gray-500">No domains yet. Add one above to begin. First domain becomes primary.</p>
              ) : (
                <ul className="divide-y">
                  {domains.map((d) => (
                    <li key={d.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{d.hostname}</p>
                        <p className="text-xs text-gray-500">
                          {d.primary ? 'Primary • ' : ''}{d.verified ? 'Verified' : 'Unverified'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!d.primary && (
                          <button
                            onClick={() => setPrimary(d.id)}
                            className="px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                          >
                            Set Primary
                          </button>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${d.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {d.verified ? 'Verified' : 'Pending DNS'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
              After adding your domain, configure DNS (CNAME for subdomains; ALIAS/ANAME/A for apex) to point to your hosting provider. Verification and SSL provisioning will be added in the next phase.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
