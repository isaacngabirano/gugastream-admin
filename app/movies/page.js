"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isNewRelease } from "@/lib/analytics";
import Link from "next/link";
import { 
  Film, Search, Trash2, Edit, ArrowLeft, Star, Zap, Eye, Calendar, Plus, X, AlertTriangle
} from "lucide-react";

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/");
      return;
    }

    fetchMovies();
  }, [router]);

  const fetchMovies = async () => {
    try {
      const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const moviesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        views: doc.data().views || 0,
        createdAtDate: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      }));
      setMovies(moviesList);
      setFilteredMovies(moviesList);
    } catch (e) {
      console.error("Error fetching movies:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredMovies(movies);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      setFilteredMovies(movies.filter(m => 
        m.name?.toLowerCase().includes(lowerTerm) || 
        m.vj?.toLowerCase().includes(lowerTerm) ||
        m.genre?.toLowerCase().includes(lowerTerm)
      ));
    }
  }, [searchTerm, movies]);

  const initiateDelete = (id, name) => {
    setDeleteModal({ show: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    if (!id) return;

    try {
      await deleteDoc(doc(db, "movies", id));
      setMovies(prev => prev.filter(m => m.id !== id));
      // filteredMovies updates automatically via useEffect if we depend on movies, 
      // but here we depend on searchTerm and movies. 
      // Let's rely on the useEffect dependency [searchTerm, movies] to update filteredMovies.
      // Wait, setMovies updates 'movies', which triggers useEffect -> setFilteredMovies.
      
      // Close modal
      setDeleteModal({ show: false, id: null, name: '' });
    } catch (e) {
      console.error("Error deleting movie:", e);
      alert("Error deleting movie");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">All Movies</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your complete content library</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <Link 
              href="/add-movie" 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-green-900/20 whitespace-nowrap"
            >
              <Plus size={20} /> Add Movie
            </Link>
          </div>
        </header>

        {/* Movies List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm bg-gray-800/50">
                  <th className="py-4 pl-6 w-24">Thumbnail</th>
                  <th className="py-4 pl-4">Movie Details</th>
                  <th className="py-4">VJ</th>
                  <th className="py-4">Category</th>
                  <th className="py-4 text-right">Views</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredMovies.map((movie) => {
                  const isNew = isNewRelease(movie.createdAt);
                  
                  return (
                    <tr key={movie.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition group">
                      <td className="py-4 pl-6">
                        <div className="w-16 h-24 bg-gray-700 rounded-md overflow-hidden shadow-md">
                          <img 
                            src={movie.thumbnail || "/placeholder.png"} 
                            alt={movie.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {e.target.src = "https://via.placeholder.com/150x225?text=No+Img"}} 
                          />
                        </div>
                      </td>
                      <td className="py-4 pl-4">
                        <div className="font-bold text-white text-base mb-1">{movie.name}</div>
                        <div className="flex items-center gap-2">
                           {isNew && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-green-500/20 text-green-400 border border-green-500/30">New</span>}
                           <span className="text-gray-500 text-xs flex items-center gap-1"><Calendar size={10} /> {movie.createdAtDate ? movie.createdAtDate.toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">{movie.vj}</td>
                      <td className="py-4 text-gray-300">
                        <span className="px-2 py-1 rounded bg-gray-700/50 border border-gray-600/50 text-xs">
                          {movie.genre}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono text-blue-300">
                        <div className="flex items-center justify-end gap-1">
                          <Eye size={14} className="text-gray-500" />
                          {movie.views.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/edit-movie/${movie.id}`}
                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => initiateDelete(movie.id, movie.name)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredMovies.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No movies found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700 transform transition-all scale-100 p-6 relative">
            <button 
              onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Delete Movie?</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete <span className="text-white font-medium">"{deleteModal.name}"</span>? 
                <br/>This action cannot be undone.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={confirmDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition shadow-lg shadow-red-900/20"
                >
                  Yes, Delete Movie
                </button>
                <button 
                  onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
