"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Save, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { VJ_LIST, CATEGORY_LIST } from "@/lib/analytics";

export default function EditMovie() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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
      return;
    }

    const fetchMovie = async () => {
      try {
        const docRef = doc(db, "movies", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            title: data.name || "",
            description: data.description || "",
            vj: data.vj || VJ_LIST[0],
            category: data.genre || CATEGORY_LIST[0],
            year: data.year || new Date().getFullYear(),
            duration: data.time || 120,
            thumbnailVertical: data.thumbnail || "",
            thumbnailHorizontal: data.thumbnailHorizontal || "",
            videoUrl: data.videoURL || ""
          });
        } else {
          alert("Movie not found!");
          router.push("/dashboard");
        }
      } catch (e) {
        console.error("Error fetching movie:", e);
        alert("Error loading movie details");
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id, router]);

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
        thumbnail: formData.thumbnailVertical,
        thumbnailHorizontal: formData.thumbnailHorizontal,
        videoURL: formData.videoUrl,
        updatedAt: serverTimestamp(),
        // We preserve other fields like views, createdAt, etc. by only sending updates
      };

      const docRef = doc(db, "movies", id);
      await updateDoc(docRef, movieData);
      
      setShowSuccessModal(true);
      
    } catch (e) {
      console.error("Error updating movie: ", e);
      alert("Error updating movie: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Movie Details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-700 bg-gray-800/50">
            <h1 className="text-2xl font-bold text-white">Edit Movie</h1>
            <p className="text-gray-400 text-sm mt-1">Update movie details, VJ attribution, or assets.</p>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-blue-900/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : <><Save size={24} /> Save Changes</>}
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
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-blue-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Movie Updated!</h2>
              <p className="text-gray-400 mb-6">
                The details for <span className="text-white font-medium">{formData.title}</span> have been successfully updated.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
                >
                  Return to Dashboard
                </button>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
