import { useEffect, useState, useRef } from 'react';
import api from '../../lib/api';
import { Plus, Trash2, X, Upload } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  image: string;
  category: string;
}

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Photography'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const res = await api.get('/gallery');
    setItems(res.data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('image', imageFile);

      await api.post('/gallery', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchGallery();
      closeModal();
    } catch (error) {
      console.error('Error saving item', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await api.delete(`/gallery/${id}`);
      fetchGallery();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', category: 'Photography' });
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Gallery</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-white/10">
            <div className="aspect-square">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <h3 className="font-medium truncate">{item.title}</h3>
              <p className="text-xs text-zinc-500">{item.category}</p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 bg-red-500/80 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center text-zinc-500 py-12">No gallery items found.</div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Gallery Item</h2>
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
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-black border border-white/10 border-dashed rounded-lg px-3 py-6 focus:border-rose-500 outline-none hover:border-rose-500/50 transition-colors flex flex-col items-center gap-2 text-zinc-400"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">{imageFile ? imageFile.name : 'Click to upload image'}</span>
                </button>
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-white/10" />
                  </div>
                )}
                {!imageFile && (
                  <p className="text-xs text-rose-400 mt-1">* Image is required</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!imageFile}
                className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Gallery
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
