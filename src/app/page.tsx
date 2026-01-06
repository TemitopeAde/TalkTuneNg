import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'

export default async function RootPage() {
  // Check for authentication
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth-token')
  const session = await getServerSession()

  // If authenticated, go to dashboard
  if (authToken || session) {
    redirect('/dashboard')
  }

  // Otherwise, go to login
  redirect('/auth/login')
}
