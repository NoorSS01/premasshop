import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const { data: todayStats } = useQuery({
    queryKey: ['admin-stats-today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (error) throw error;

      const revenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;
      const profit = orders?.reduce((sum, o) => {
        const itemProfit = Array.isArray(o.items)
          ? o.items.reduce((p: number, item: any) => {
              return p + (item.price - (item.cost_price || 0)) * item.qty;
            }, 0)
          : 0;
        return sum + itemProfit - (parseFloat(o.delivery_cost) || 20);
      }, 0) || 0;

      return {
        ordersCount: orders?.length || 0,
        revenue,
        profit,
        pendingOrders: orders?.filter((o) => o.status === 'pending').length || 0,
      };
    },
  });

  const { data: deliveryPartners } = useQuery({
    queryKey: ['delivery-partners-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('status', 'approved')
        .eq('allowed', true);
      if (error) throw error;
      return data?.length || 0;
    },
  });

  const { data: ordersChart } = useQuery({
    queryKey: ['admin-orders-chart'],
    queryFn: async () => {
      const days = 7;
      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());

        if (error) throw error;

        const revenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;

        data.push({
          date: format(date, 'MMM dd'),
          orders: orders?.length || 0,
          revenue,
        });
      }
      return data;
    },
  });

  const { data: deliveryStats } = useQuery({
    queryKey: ['admin-delivery-stats'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status');

      if (error) throw error;

      const stats = {
        delivered: orders?.filter((o) => o.status === 'delivered').length || 0,
        pending: orders?.filter((o) => o.status === 'pending' || o.status === 'assigned').length || 0,
        cancelled: orders?.filter((o) => o.status === 'cancelled').length || 0,
      };

      return [
        { name: 'Delivered', value: stats.delivered },
        { name: 'Pending', value: stats.pending },
        { name: 'Cancelled', value: stats.cancelled },
      ];
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Orders</h3>
          <p className="text-3xl font-bold text-primary-600">
            {todayStats?.ordersCount || 0}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue Today</h3>
          <p className="text-3xl font-bold text-green-600">₹{todayStats?.revenue.toFixed(2) || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Profit/Loss Today</h3>
          <p
            className={`text-3xl font-bold ${
              (todayStats?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ₹{todayStats?.profit.toFixed(2) || 0}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {todayStats?.pendingOrders || 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Orders & Revenue (Last 7 Days)</h2>
          {ordersChart && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#ef4444" name="Orders" />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Delivery Performance</h2>
          {deliveryStats && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Active Delivery Partners</p>
            <p className="text-2xl font-bold">{deliveryPartners || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

