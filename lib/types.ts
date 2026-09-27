export interface CurrentUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: 'USER' | 'ADMIN'
  bio: string | null
  emailNotifications: boolean
  notificationEmail: string | null
}