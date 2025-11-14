import { User, MapPin, Phone, Mail, LogOut, Settings } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AccountPage() {
  const userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, City, State 12345'
  }

  const menuItems = [
    { icon: User, label: 'Personal Information', action: 'personal' },
    { icon: MapPin, label: 'Delivery Addresses', action: 'addresses' },
    { icon: Phone, label: 'Phone Numbers', action: 'phones' },
    { icon: Mail, label: 'Email Preferences', action: 'email' },
    { icon: Settings, label: 'Settings', action: 'settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{userInfo.name}</h1>
            <p className="text-sm opacity-90">{userInfo.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">12</p>
          <p className="text-xs text-muted-foreground">Total Orders</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">$486</p>
          <p className="text-xs text-muted-foreground">Total Spent</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">Gold</p>
          <p className="text-xs text-muted-foreground">Member Level</p>
        </Card>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.action} className="p-0">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            </Card>
          )
        })}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-6">
        <Button variant="outline" className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  )
}
