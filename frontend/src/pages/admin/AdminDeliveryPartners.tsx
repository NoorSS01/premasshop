import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export default function AdminDeliveryPartners() {
  const { data: partners, refetch } = useQuery({
    queryKey: ['admin-delivery-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('*, users(full_name, email, phone)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approvePartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_partners')
        .update({
          status: 'approved',
          allowed: true,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const pausePartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_partners')
        .update({
          status: 'paused',
          allowed: false,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const deletePartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_partners')
        .update({
          status: 'deleted',
          allowed: false,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Partners</h1>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Phone</th>
                <th className="text-left py-3 px-4 font-semibold">Vehicle</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners?.map((partner) => (
                <tr key={partner.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{partner.users?.full_name || 'N/A'}</td>
                  <td className="py-3 px-4">{partner.users?.email || 'N/A'}</td>
                  <td className="py-3 px-4">{partner.users?.phone || 'N/A'}</td>
                  <td className="py-3 px-4">{partner.vehicle_info || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(partner.status)}`}
                    >
                      {partner.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {partner.status === 'pending' && (
                        <button
                          onClick={() => {
                            if (confirm('Approve this delivery partner?')) {
                              approvePartner.mutate(partner.id);
                            }
                          }}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Approve
                        </button>
                      )}
                      {partner.status === 'approved' && (
                        <button
                          onClick={() => {
                            if (confirm('Pause this delivery partner?')) {
                              pausePartner.mutate(partner.id);
                            }
                          }}
                          className="text-yellow-600 hover:text-yellow-700 text-sm"
                        >
                          Pause
                        </button>
                      )}
                      {partner.status === 'paused' && (
                        <button
                          onClick={() => {
                            if (confirm('Re-approve this delivery partner?')) {
                              approvePartner.mutate(partner.id);
                            }
                          }}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this delivery partner? This action cannot be undone.'
                            )
                          ) {
                            deletePartner.mutate(partner.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

