import { useEffect, useState, useRef } from 'react';
import api from '../../lib/api';
import { Save, Upload, Loader2 } from 'lucide-react';

interface ContentForm {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  intro_title: string;
  intro_description: string;
  intro_image: string;
}

export default function AdminContent() {
  const [content, setContent] = useState<ContentForm>({
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    intro_title: '',
    intro_description: '',
    intro_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState('');
  const [introImageFile, setIntroImageFile] = useState<File | null>(null);
  const [introImagePreview, setIntroImagePreview] = useState('');
  const heroFileRef = useRef<HTMLInputElement>(null);
  const introFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get('/content');
      setContent({
        hero_title: res.data.hero_title || '',
        hero_subtitle: res.data.hero_subtitle || '',
        hero_image: res.data.hero_image || '',
        intro_title: res.data.intro_title || '',
        intro_description: res.data.intro_description || '',
        intro_image: res.data.intro_image || '',
      });
      setHeroImagePreview(res.data.hero_image || '');
      setIntroImagePreview(res.data.intro_image || '');
    } catch (error) {
      console.error('Error fetching content', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setHeroImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleIntroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIntroImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIntroImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage('');
    try {
      // Save text content
      const textFields = [
        { key: 'hero_title', value: content.hero_title },
        { key: 'hero_subtitle', value: content.hero_subtitle },
        { key: 'intro_title', value: content.intro_title },
        { key: 'intro_description', value: content.intro_description },
      ];

      for (const field of textFields) {
        await api.put('/content/text', field);
      }

      // Upload hero image if changed
      if (heroImageFile) {
        const formData = new FormData();
        formData.append('key', 'hero_image');
        formData.append('image', heroImageFile);
        await api.put('/content/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setHeroImageFile(null);
      }

      // Upload intro image if changed
      if (introImageFile) {
        const formData = new FormData();
        formData.append('key', 'intro_image');
        formData.append('image', introImageFile);
        await api.put('/content/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setIntroImageFile(null);
      }

      setSavedMessage('Content saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
      fetchContent();
    } catch (error) {
      console.error('Error saving content', error);
      setSavedMessage('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Homepage Content</h1>
          <p className="text-zinc-400 mt-1">Manage the text and images displayed on the main page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-rose-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {savedMessage && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${savedMessage.includes('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-green-500/10 border border-green-500/20 text-green-500'}`}>
          {savedMessage}
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-zinc-900 rounded-xl border border-white/10 p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">Hero Section</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={content.hero_title}
                onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Subtitle</label>
              <input
                type="text"
                value={content.hero_subtitle}
                onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Hero Background Image</label>
            <input
              ref={heroFileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleHeroImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => heroFileRef.current?.click()}
              className="w-full bg-black border border-white/10 border-dashed rounded-lg px-3 py-4 hover:border-rose-500/50 transition-colors flex flex-col items-center gap-2 text-zinc-400"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm">{heroImageFile ? heroImageFile.name : 'Click to change hero image'}</span>
            </button>
            {heroImagePreview && (
              <div className="mt-3">
                <img src={heroImagePreview} alt="Hero Preview" className="w-full h-32 object-cover rounded-lg border border-white/10" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="bg-zinc-900 rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-6">Introduction Section</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={content.intro_title}
                onChange={(e) => setContent({ ...content, intro_title: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Description</label>
              <textarea
                rows={5}
                value={content.intro_description}
                onChange={(e) => setContent({ ...content, intro_description: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:border-rose-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Section Image</label>
            <input
              ref={introFileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleIntroImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => introFileRef.current?.click()}
              className="w-full bg-black border border-white/10 border-dashed rounded-lg px-3 py-4 hover:border-rose-500/50 transition-colors flex flex-col items-center gap-2 text-zinc-400"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm">{introImageFile ? introImageFile.name : 'Click to change section image'}</span>
            </button>
            {introImagePreview && (
              <div className="mt-3">
                <img src={introImagePreview} alt="Intro Preview" className="w-full h-32 object-cover rounded-lg border border-white/10" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
