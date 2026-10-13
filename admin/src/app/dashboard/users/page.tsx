import { redirect } from 'next/navigation'

export default function UsersPage() {
  // Redirect to the "all users" page
  redirect('/dashboard/users/all')
}
