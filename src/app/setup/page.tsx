export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Setup Your QR Code Generator</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Create a Supabase Project</h2>
              <p className="text-gray-600 mb-2">Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">supabase.com</a> and create a new project.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Get Your API Keys</h2>
              <p className="text-gray-600 mb-2">Go to your project settings at:</p>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                https://supabase.com/dashboard/project/_/settings/api
              </code>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Configure Environment Variables</h2>
              <p className="text-gray-600 mb-2">Create or update your <code className="bg-gray-100 px-1 rounded">.env.local</code> file with:</p>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`# Database URL (from Supabase project settings > Database)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase API (from project settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"`}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Enable Authentication</h2>
              <p className="text-gray-600 mb-2">In your Supabase dashboard:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Go to Authentication → Providers</li>
                <li>Enable Email provider</li>
                <li>Disable &quot;Confirm email&quot; for easier testing (optional)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Run Database Migrations</h2>
              <p className="text-gray-600 mb-2">After setting up your environment variables, run:</p>
              <pre className="bg-gray-100 p-4 rounded text-sm">
{`npx prisma db push`}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Restart Your Development Server</h2>
              <p className="text-gray-600 mb-2">Stop and restart your server to load the new environment variables:</p>
              <pre className="bg-gray-100 p-4 rounded text-sm">
{`npm run dev`}
              </pre>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                After completing these steps, you&apos;ll be redirected to the login page automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}