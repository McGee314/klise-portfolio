import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">About KLISE</h1>
          <p className="text-xl text-zinc-400">
            Fostering creativity through the lens since 2020.
          </p>
        </motion.div>

        <div className="space-y-24">
          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5"
            >
              <h2 className="text-2xl font-bold mb-4 text-rose-500">Our Mission</h2>
              <p className="text-zinc-400 leading-relaxed">
                To provide a platform for aspiring photographers and filmmakers to learn, collaborate, and showcase their talent. We aim to nurture a community where creativity knows no bounds.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5"
            >
              <h2 className="text-2xl font-bold mb-4 text-rose-500">Our Vision</h2>
              <p className="text-zinc-400 leading-relaxed">
                To become the leading student-led creative community that sets the standard for visual storytelling and artistic excellence.
              </p>
            </motion.div>
          </div>

          {/* What We Do */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Workshops",
                  desc: "Hands-on sessions on camera basics, lighting, editing, and more.",
                  image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop"
                },
                {
                  title: "Photo Hunting",
                  desc: "Outdoor trips to capture the beauty of nature and urban landscapes.",
                  image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=800&auto=format&fit=crop"
                },
                {
                  title: "Exhibitions",
                  desc: "Showcasing the best works of our members to the public.",
                  image: "https://images.unsplash.com/photo-1518998053901-5348d3969104?q=80&w=800&auto=format&fit=crop"
                }
              ].map((item, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl aspect-[4/5]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-zinc-300 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
