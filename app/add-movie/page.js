"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Save, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { VJ_LIST, CATEGORY_LIST } from "@/lib/analytics";

export default function AddMovie() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedMovie, setAddedMovie] = useState(null);
  
  const initialFormState = {
    title: "",
    description: "",
    vj: VJ_LIST[0],
    category: CATEGORY_LIST[0],
    year: new Date().getFullYear(),
    duration: 120,
    thumbnailVertical: "",
    thumbnailHorizontal: "",
    videoUrl: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (!localStorage.getItem("isAdmin")) {
      router.push("/");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const movieData = {
        name: formData.title,
        description: formData.description,
        vj: formData.vj,
        genre: formData.category,
        year: parseInt(formData.year),
        time: parseInt(formData.duration),
        thumbnail: formData.thumbnailVertical, // Primary for mobile list
        thumbnailHorizontal: formData.thumbnailHorizontal, // Hero/Banner
        videoURL: formData.videoUrl,
        views: 0,
        createdAt: serverTimestamp(),
        versions: ["Original", formData.vj]
      };

      await addDoc(collection(db, "movies"), movieData);
      
      setAddedMovie(movieData);
      setShowSuccessModal(true);
      
    } catch (e) {
      console.error("Error adding movie: ", e);
      alert("Error adding movie: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setShowSuccessModal(false);
    setAddedMovie(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-700 bg-gray-800/50">
            <h1 className="text-2xl font-bold text-white">Upload New Movie</h1>
            <p className="text-gray-400 text-sm mt-1">Enter movie details, assign VJ, and link Cloudinary assets.</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Basic Info */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">Movie Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Movie Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition"
                      placeholder="e.g. The Matrix"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Year</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Duration (mins)</label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition"
                    placeholder="Brief synopsis..."
                    required
                  ></textarea>
                </div>
              </div>

              {/* Section 2: Classification */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">Classification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">VJ Attribution</label>
                    <select
                      name="vj"
                      value={formData.vj}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition"
                    >
                      {VJ_LIST.map(vj => <option key={vj} value={vj}>{vj}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition"
                    >
                      {CATEGORY_LIST.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Assets */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">Media Assets</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Vertical Poster URL</label>
                    <input
                      type="url"
                      name="thumbnailVertical"
                      value={formData.thumbnailVertical}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition"
                      required
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Horizontal Banner URL</label>
                    <input
                      type="url"
                      name="thumbnailHorizontal"
                      value={formData.thumbnailHorizontal}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Previews */}
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {formData.thumbnailVertical && (
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500 mb-1">Poster Preview</p>
                      <img src={formData.thumbnailVertical} alt="Poster" className="h-32 w-auto rounded-lg border border-gray-700" />
                    </div>
                  )}
                  {formData.thumbnailHorizontal && (
                     <div className="flex-shrink-0">
                      <p className="text-xs text-gray-500 mb-1">Banner Preview</p>
                      <img src={formData.thumbnailHorizontal} alt="Banner" className="h-32 w-auto rounded-lg border border-gray-700" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Video Source URL (Cloudinary)</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-700 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-green-900/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : <><Save size={24} /> Publish Movie</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700 transform transition-all scale-100 p-6 relative">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Movie Published!</h2>
              <p className="text-gray-400 mb-6">
                <span className="text-white font-medium">{addedMovie?.name}</span> has been successfully added to the library.
              </p>

              {/* Mini Preview */}
              <div className="bg-gray-900 p-3 rounded-lg flex items-center gap-3 w-full mb-6 border border-gray-700">
                <img src={addedMovie?.thumbnail} alt="" className="w-12 h-16 object-cover rounded" />
                <div className="text-left">
                  <p className="font-bold text-sm text-white">{addedMovie?.name}</p>
                  <p className="text-xs text-gray-500">{addedMovie?.vj} • {addedMovie?.genre}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleReset}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition"
                >
                  Add Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
