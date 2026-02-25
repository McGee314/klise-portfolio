import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
  category: string;
}

export default function AdminActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    image: '',
    category: 'Photography'
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const res = await api.get('/activities');
    setActivities(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/activities/${editingId}`, formData);
      } else {
        await api.post('/activities', formData);
      }
      fetchActivities();
      closeModal();
    } catch (error) {
      console.error('Error saving activity', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      await api.delete(`/activities/${id}`);
      fetchActivities();
    }
  };

  const openModal = (activity?: Activity) => {
    if (activity) {
      setEditingId(activity.id);
      setFormData({
        title: activity.title,
        description: activity.description,
        date: activity.date,
        image: activity.image,
        category: activity.category
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        image: '',
        category: 'Photography'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Activities</h1>
        <button
          onClick={() => openModal()}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/50 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium">{activity.title}</td>
                <td className="px-6 py-4 text-zinc-400">{new Date(activity.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className="bg-white/10 px-2 py-1 rounded text-xs">{activity.category}</span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(activity)} className="text-zinc-400 hover:text-white">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(activity.id)} className="text-zinc-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No activities found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Activity' : 'New Activity'}</h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
                  >
                    <option value="Photography">Photography</option>
                    <option value="Cinematography">Cinematography</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Image URL</label>
                <input
                  required
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition-colors mt-2"
              >
                {editingId ? 'Update Activity' : 'Create Activity'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
