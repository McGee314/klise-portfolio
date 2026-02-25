import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { Calendar, Tag } from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
  category: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activities');
        setActivities(res.data);
      } catch (error) {
        console.error('Failed to fetch activities', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">Our Activities</h1>
          <p className="text-xl text-zinc-400">
            Join us in our journey of exploration and creation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/50 transition-colors group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full uppercase">
                    <Tag className="w-3 h-3" />
                    {activity.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-rose-500 transition-colors">
                  {activity.title}
                </h3>
                <p className="text-zinc-400 text-sm line-clamp-3">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center text-zinc-500 py-20">
            No activities found. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
