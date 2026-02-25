import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Activity, Image, Users } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ activities: 0, gallery: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [activitiesRes, galleryRes] = await Promise.all([
          api.get('/activities'),
          api.get('/gallery')
        ]);
        setStats({
          activities: activitiesRes.data.length,
          gallery: galleryRes.data.length
        });
      } catch (error) {
        console.error('Error fetching stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Total Activities</h3>
            <Activity className="text-rose-500 w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{stats.activities}</p>
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Gallery Items</h3>
            <Image className="text-rose-500 w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{stats.gallery}</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Active Admins</h3>
            <Users className="text-rose-500 w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">1</p>
        </div>
      </div>

      <div className="mt-12 bg-zinc-900 p-8 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4">Welcome back, Admin!</h2>
        <p className="text-zinc-400">
          Use the sidebar to manage your activities and gallery items. You can create, update, and delete content that will be instantly reflected on the public website.
        </p>
      </div>
    </div>
  );
}
