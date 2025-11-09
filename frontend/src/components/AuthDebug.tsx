import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthDebug() {
  const { user, profile, session, loading } = useAuth();

  const testSignOut = async () => {
    console.log('Testing sign out...');
    try {
      const { error } = await supabase.auth.signOut();
      console.log('Direct Supabase signOut result:', { error });
      if (!error) {
        console.log('Sign out successful, reloading page...');
        window.location.reload();
      }
    } catch (err) {
      console.error('Direct sign out error:', err);
    }
  };

  const checkAuthState = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Current session:', { session, error });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', { user, userError });
  };

  return (
    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 m-4">
      <h3 className="font-bold text-lg mb-2">🔍 Auth Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'None'}</p>
        <p><strong>Profile:</strong> {profile ? `${profile.full_name} (${profile.role})` : 'None'}</p>
        <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          onClick={checkAuthState}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Check Auth State
        </button>
        <button 
          onClick={testSignOut}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Direct Sign Out
        </button>
      </div>
    </div>
  );
}
