import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-muted-foreground">Page not found</p>
      <Button asChild className="mt-8">
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  )
}
