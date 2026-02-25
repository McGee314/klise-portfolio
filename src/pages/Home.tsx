import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Camera, Film, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop"
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
              KLISE
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 font-light tracking-wide mb-8">
              Photography and Cinematography Community
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
              <h2 className="text-4xl font-bold mb-6">Capturing Life in Motion</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                KLISE is more than just a club; it's a collective of visionaries, storytellers, and artists. 
                We believe that every frame holds a story waiting to be told. Whether through the lens of a camera 
                or the motion of film, we strive to capture the essence of the world around us.
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
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop"
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
