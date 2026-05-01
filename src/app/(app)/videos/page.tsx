"use client";

import { useState, useEffect } from "react";
import { 
  Play, 
  X, 
  Clock, 
  Bookmark, 
  Sparkles,
  PlaySquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface VideoAnimation {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail_url: string;
  video_url: string;
  youtube_id?: string;
  topic_id: string;
  course_name: string;
}

const mockVideos: VideoAnimation[] = [
  {
    id: "v1",
    title: "Tort Law / Negligence",
    description: "Foundational overview of the concepts of liability, duty of care, and general tortious conduct.",
    duration: "2:30",
    thumbnail_url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800",
    video_url: "",
    youtube_id: "TFdprG8tXzY",
    topic_id: "t4",
    course_name: "Tort Law"
  },
  {
    id: "v2",
    title: "The Neighbor Principle",
    description: "A cinematic breakdown of Donoghue v Stevenson (1932), the iconic snail in the ginger beer case that defined the modern law of negligence.",
    duration: "3:15",
    thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
    video_url: "",
    youtube_id: "WgEYzgrNvy0",
    topic_id: "t4",
    course_name: "Tort Law"
  },
  {
    id: "v3",
    title: "Actus Reus & Mens Rea",
    description: "A deep dive into the dual foundational requirements of criminal liability — the guilty act and the guilty mind.",
    duration: "4:00",
    thumbnail_url: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&q=80&w=800",
    video_url: "",
    youtube_id: "26m_LpLzC40",
    topic_id: "t5",
    course_name: "Criminal Law"
  },
  {
    id: "v4",
    title: "Unilateral Contract Offers",
    description: "Examine Carlill v Carbolic Smoke Ball Co. to understand how a general statement can legally constitute an offer to the whole world.",
    duration: "2:45",
    thumbnail_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800",
    video_url: "",
    youtube_id: "YSiyuHoit9s",
    topic_id: "t1",
    course_name: "Contract Law"
  },
  {
    id: "v5",
    title: "Separation of Powers",
    description: "An illustrative breakdown of the structural checks and balances defining the modern state apparatus.",
    duration: "3:30",
    thumbnail_url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-lawyer-preparing-documents-at-the-desk-41270-large.mp4",
    topic_id: "t6",
    course_name: "Constitutional Law"
  }
];

export default function VideoGallery() {
  const [videos, setVideos] = useState<VideoAnimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoAnimation | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Automatically clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("video_animations")
        .select(`
          id,
          title,
          description,
          duration,
          thumbnail_url,
          video_url,
          youtube_id,
          topic_id,
          topics (
            name,
            courses (name)
          )
        `);

      if (error || !data || data.length === 0) {
        console.log("Using mock data for Video Gallery");
        setVideos(mockVideos);
      } else {
        const transformed: VideoAnimation[] = data.map((v: any) => ({
          id: v.id,
          title: v.title || "Untitled Simulation",
          description: v.description || "No description provided.",
          duration: v.duration || "N/A",
          thumbnail_url: v.thumbnail_url || "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800",
          video_url: v.video_url || "",
          youtube_id: v.youtube_id || undefined,
          topic_id: v.topic_id,
          course_name: v.topics?.courses?.name || v.topics?.name || "Legal Topic"
        }));
        setVideos(transformed);
      }
      setLoading(false);
    }

    fetchVideos();
  }, []);

  // Handle auto-playing specific topics via query params (contextual linking)
  useEffect(() => {
    if (typeof window !== "undefined" && videos.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const autoPlayTopicId = params.get("play");
      const ytId = params.get("yt");
      const title = params.get("title");
      
      if (ytId) {
        setSelectedVideo({
          id: "dynamic-video",
          title: title || "Case Animation",
          description: "Auto-generated visualization from authorities.",
          duration: "N/A",
          thumbnail_url: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
          video_url: "",
          youtube_id: ytId,
          topic_id: "dynamic",
          course_name: "Legal Case Study"
        });
      } else if (autoPlayTopicId) {
        const videoToPlay = videos.find(v => v.topic_id === autoPlayTopicId);
        if (videoToPlay) {
          setSelectedVideo(videoToPlay);
        }
      }
    }
  }, [videos]);

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-700">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30 text-primary shadow-lg shadow-primary/10">
            <PlaySquare className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-1">
              Video Vault
            </h1>
            <p className="font-body text-on-surface-variant/70 text-sm">
              Cinematic AI visual summaries of foundational legal mechanics.
            </p>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-sm">
          <Sparkles className="h-4 w-4" />
          Powered by Google Veo 3.1
        </div>
      </header>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse flex flex-col gap-4">
              <div className="aspect-video bg-neutral-900 rounded-2xl" />
              <div className="h-5 bg-neutral-900 rounded w-2/3" />
              <div className="h-4 bg-neutral-900 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col cursor-pointer group"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail Container */}
              <div 
                className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 shadow-xl border border-white/5 group-hover:border-primary/50 group-hover:shadow-primary/10 transition-all duration-300"
                style={{ 
                  backgroundImage: `url(${video.thumbnail_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Play Icon Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
                  <div className="bg-black/60 p-4 rounded-full border border-white/20 group-hover:border-primary/50 group-hover:bg-primary/90 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 text-white">
                    <Play className="h-6 w-6 fill-current" />
                  </div>
                </div>

                {/* Title overlay at the bottom left */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 flex items-end">
                  <h3 className="font-headline text-lg font-extrabold text-white group-hover:text-primary transition-colors duration-300 leading-tight">
                    {video.title}
                  </h3>
                </div>
              </div>

              {/* Metadata Bar */}
              <div className="flex items-center justify-between mt-3 px-1 text-sm font-label">
                <div className="flex items-center gap-2 text-on-surface-variant/60">
                  <Clock className="h-4 w-4" />
                  <span>{video.duration} mins</span>
                </div>
                <span className="bg-[#3D1F5C] text-[#DCB8FF] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-primary/20">
                  {video.course_name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Custom Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl bg-surface-container-low border border-outline-variant/10 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className="bg-[#3D1F5C] text-[#DCB8FF] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {selectedVideo.course_name}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {selectedVideo.youtube_id ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1&rel=0`} 
                    frameBorder="0" 
                    allow="autoplay; encrypted-media" 
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : selectedVideo.video_url ? (
                  <video 
                    src={selectedVideo.video_url} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-gray-400">
                    <PlaySquare className="h-12 w-12 opacity-50" />
                    <span>No video file available</span>
                  </div>
                )}
              </div>

              {/* Info & Related links */}
              <div className="p-6 md:p-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">
                  {selectedVideo.title}
                </h2>
                <p className="font-body text-on-surface-variant text-base mb-6 leading-relaxed">
                  {selectedVideo.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href={`/notes/topic/${selectedVideo.topic_id}`}
                    className="flex items-center justify-center gap-3 bg-primary hover:bg-primary-container text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 text-center"
                  >
                    <Bookmark className="h-5 w-5" />
                    Read Related Notes
                  </Link>

                  <button 
                    onClick={() => setToast("AI Video Generation is in queue. We'll notify you when your custom visual is ready!")}
                    className="flex items-center justify-center gap-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3.5 px-6 rounded-xl border border-primary/50 backdrop-blur-sm transition-all duration-300 text-center cursor-pointer shadow-md"
                  >
                    ✨ Generate Custom AI Animation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-surface-container-highest/90 border border-primary/30 text-on-surface px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 font-label font-bold text-sm"
          >
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
