import { Package, Clock, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function OrdersPage() {
  const orders = [
    {
      id: 'ORD001',
      date: '2024-01-15',
      status: 'delivered',
      total: 45.99,
      items: 5
    },
    {
      id: 'ORD002',
      date: '2024-01-14',
      status: 'processing',
      total: 32.50,
      items: 3
    },
    {
      id: 'ORD003',
      date: '2024-01-13',
      status: 'shipped',
      total: 67.25,
      items: 8
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'shipped':
        return <Package className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered'
      case 'processing':
        return 'Processing'
      case 'shipped':
        return 'Shipped'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-semibold">My Orders</h1>
      </div>
      
      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">Order #{order.id}</h3>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  <span className="text-sm">{getStatusText(order.status)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">{order.items} items</p>
                  <p className="font-bold">${order.total.toFixed(2)}</p>
                </div>
                <button className="text-sm text-primary font-medium">
                  View Details
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
