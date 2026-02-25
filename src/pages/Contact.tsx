import { motion } from 'motion/react';
import { Instagram, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-zinc-400">
            Have questions or want to join? Reach out to us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-500">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Email Us</p>
                    <p className="font-medium">contact@klise.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-500">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Follow Us</p>
                    <p className="font-medium">@klise_community</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-500">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Location</p>
                    <p className="font-medium">University Campus, Building A</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Feed Simulation */}
            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Instagram</h3>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-rose-500 text-sm hover:underline">View Profile</a>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-zinc-800 rounded-md overflow-hidden">
                     <img src={`https://picsum.photos/200?random=${i}`} alt="Instagram post" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer"/>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 p-8 rounded-2xl border border-white/10"
          >
            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-rose-600 text-white font-bold py-4 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
