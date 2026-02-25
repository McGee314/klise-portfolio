import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Camera, Film, ArrowRight } from 'lucide-react';
import api from '../lib/api';

interface SiteContent {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  intro_title: string;
  intro_description: string;
  intro_image: string;
}

export default function Home() {
  const [content, setContent] = useState<SiteContent>({
    hero_title: 'KLISE',
    hero_subtitle: 'Photography and Cinematography Community',
    hero_image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop',
    intro_title: 'Capturing Life in Motion',
    intro_description: "KLISE is more than just a club; it's a collective of visionaries, storytellers, and artists. We believe that every frame holds a story waiting to be told. Whether through the lens of a camera or the motion of film, we strive to capture the essence of the world around us.",
    intro_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/content');
        setContent((prev) => ({
          hero_title: res.data.hero_title || prev.hero_title,
          hero_subtitle: res.data.hero_subtitle || prev.hero_subtitle,
          hero_image: res.data.hero_image || prev.hero_image,
          intro_title: res.data.intro_title || prev.intro_title,
          intro_description: res.data.intro_description || prev.intro_description,
          intro_image: res.data.intro_image || prev.intro_image,
        }));
      } catch (error) {
        console.error('Failed to fetch site content', error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={content.hero_image}
            alt="Cinematic Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
              {content.hero_title}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 font-light tracking-wide mb-8">
              {content.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/activities"
                className="px-8 py-3 bg-rose-600 text-white rounded-full font-medium hover:bg-rose-700 transition-all flex items-center gap-2 group"
              >
                Explore Our Activities
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-medium hover:bg-white/20 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">{content.intro_title}</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                {content.intro_description}
              </p>
              <div className="flex gap-8">
                <div className="flex flex-col gap-2">
                  <Camera className="w-8 h-8 text-rose-600" />
                  <span className="font-bold text-lg">Photography</span>
                  <p className="text-sm text-zinc-500">Mastering the art of still images.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Film className="w-8 h-8 text-rose-600" />
                  <span className="font-bold text-lg">Cinematography</span>
                  <p className="text-sm text-zinc-500">Crafting visual narratives in motion.</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-rose-600/20 rounded-2xl blur-xl" />
              <img
                src={content.intro_image}
                alt="Camera Lens"
                className="relative rounded-2xl border border-white/10 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
