"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateMockPackageData, generateMockGrowthData, VJ_LIST, isNewRelease, exportToCSV } from "@/lib/analytics";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Film, DollarSign, Plus, LogOut, TrendingUp, Clock, HardDrive, Download, Calendar, Star, Zap, Edit, Trash2, ArrowRight, AlertTriangle, X
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384'];

export default function Dashboard() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [cloudinaryUsage, setCloudinaryUsage] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedVj, setSelectedVj] = useState("All");
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Movies
        const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const moviesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure views is a number
          views: doc.data().views || 0,
          // Convert timestamp to Date object for filtering
          createdAtDate: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
        }));
        setMovies(moviesList);
        setFilteredMovies(moviesList);
        
        // Mock Data Loading (Replace with real aggregations later)
        setPackageData(generateMockPackageData());
        setGrowthData(generateMockGrowthData());

        // Fetch Cloudinary Usage
        const cloudRes = await fetch('/api/cloudinary/usage');
        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          setCloudinaryUsage(cloudData);
        }
        
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // --- Filtering Logic ---
  useEffect(() => {
    if (!movies.length) return;
    
    let filtered = [...movies];
    
    // Date Filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(m => m.createdAtDate >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => m.createdAtDate <= endDate);
    }

    // VJ Filter
    if (selectedVj !== "All") {
      filtered = filtered.filter(m => m.vj === selectedVj);
    }

    setFilteredMovies(filtered);
  }, [dateRange, movies, selectedVj]);

  // --- Aggregations ---
  const totalViews = filteredMovies.reduce((sum, m) => sum + (m.views || 0), 0);
  const totalWatchTime = (totalViews * 45); // Mock: Avg 45 mins per view
  
  // VJ Aggregation (Computed from filteredMovies so it respects date range, but maybe we want global leaderboard?)
  // Usually leaderboards should reflect current filters.
  const vjStats = VJ_LIST.map(vj => {
    const vjMovies = filteredMovies.filter(m => m.vj === vj);
    const views = vjMovies.reduce((sum, m) => sum + (m.views || 0), 0);
    return { name: vj, views, count: vjMovies.length };
  }).sort((a, b) => b.views - a.views);

  const estimatedRevenue = packageData.reduce((sum, item) => sum + item.revenue, 0);

  // Popularity Threshold (Top 10% views)
  const viewsArray = movies.map(m => m.views).sort((a, b) => b - a);
  const popularityThreshold = viewsArray.length > 0 ? viewsArray[Math.floor(viewsArray.length * 0.1)] : 0;
  
  const topMovies = [...filteredMovies].sort((a, b) => b.views - a.views).slice(0, 5);

  const isPopular = (views) => {
    if (views === 0) return false;
    return views >= popularityThreshold && views > 100; // Minimum 100 views to be popular
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  const initiateDelete = (id, name) => {
    setDeleteModal({ show: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    if (!id) return;

    try {
      await deleteDoc(doc(db, "movies", id));
      // Optimistic update
      const updatedMovies = movies.filter(m => m.id !== id);
      setMovies(updatedMovies);
      // filteredMovies will update via useEffect or we can force it
      // Actually useEffect depends on 'movies', so it should update.
      // But to be instant:
      setFilteredMovies(prev => prev.filter(m => m.id !== id));
      setDeleteModal({ show: false, id: null, name: '' });
    } catch (e) {
      console.error("Error deleting movie:", e);
      alert("Error deleting movie");
    }
  };

  const handleExport = () => {
    const exportData = filteredMovies.map(m => ({
      Title: m.name,
      VJ: m.vj,
      Category: m.genre,
      Views: m.views,
      UploadDate: m.createdAtDate ? m.createdAtDate.toLocaleDateString() : 'N/A',
      IsNew: isNewRelease(m.createdAt) ? 'Yes' : 'No',
      IsPopular: isPopular(m.views) ? 'Yes' : 'No'
    }));
    exportToCSV(exportData, 'gugastream_movies_analytics.csv');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">GugaStream Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Analytics & Content Management</p>
          </div>
          <div className="flex flex-wrap gap-4">
             {/* VJ Filter */}
             <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
               <Users size={18} className="text-gray-400" />
               <select 
                 className="bg-transparent text-sm text-white focus:outline-none [&>option]:bg-gray-800"
                 value={selectedVj}
                 onChange={(e) => setSelectedVj(e.target.value)}
               >
                 <option value="All">All VJs</option>
                 {VJ_LIST.map(vj => (
                   <option key={vj} value={vj}>{vj}</option>
                 ))}
               </select>
             </div>

             <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
               <Calendar size={18} className="text-gray-400" />
               <input 
                 type="date" 
                 className="bg-transparent text-sm text-white focus:outline-none"
                 value={dateRange.start}
                 onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
               />
               <span className="text-gray-500">-</span>
               <input 
                 type="date" 
                 className="bg-transparent text-sm text-white focus:outline-none"
                 value={dateRange.end}
                 onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
               />
             </div>

            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-blue-900/20"
            >
              <Download size={20} /> Export CSV
            </button>

            <Link 
              href="/add-movie" 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-green-900/20"
            >
              <Plus size={20} /> Add Movie
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-lg font-medium transition border border-gray-700"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </header>

        {/* 1. KPI Cards (Top Row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Movies" value={filteredMovies.length} icon={<Film size={20} />} color="text-blue-400" />
          <StatCard title="Total Views" value={totalViews.toLocaleString()} icon={<Users size={20} />} color="text-green-400" />
          <StatCard title="Watch Time (hrs)" value={(totalWatchTime / 60).toFixed(0)} icon={<Clock size={20} />} color="text-purple-400" />
          <StatCard title="Revenue (UGX)" value={estimatedRevenue.toLocaleString()} icon={<DollarSign size={20} />} color="text-yellow-400" />
          <StatCard title="Active Subs" value="320" icon={<TrendingUp size={20} />} color="text-pink-400" />
          <StatCard title="Storage" value={cloudinaryUsage ? (cloudinaryUsage.total_size_bytes / 1000000000).toFixed(1) + " GB" : "Loading..."} icon={<HardDrive size={20} />} color="text-orange-400" />
        </div>

        {/* 2. Recent Uploads (Moved Above Leaderboards) */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold flex items-center gap-2">
                <Film size={18} className="text-green-400" /> Recent Uploads
              </h3>
              <Link href="/movies" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
                View All <ArrowRight size={14} />
              </Link>
             </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="pb-3 pl-2 w-16">Thumbnail</th>
                    <th className="pb-3 pl-2">Movie</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">VJ</th>
                    <th className="pb-3 text-right">Views</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredMovies.slice(0, 5).map((movie) => {
                    const isNew = isNewRelease(movie.createdAt);
                    const isPop = isPopular(movie.views);
                    
                    return (
                      <tr key={movie.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition group">
                        <td className="py-3 pl-2">
                          <div className="w-10 h-14 bg-gray-700 rounded overflow-hidden">
                            <img 
                              src={movie.thumbnail || "/placeholder.png"} 
                              alt={movie.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {e.target.src = "https://via.placeholder.com/100x150?text=No+Img"}} 
                            />
                          </div>
                        </td>
                        <td className="py-3 pl-2 font-medium">
                          <div className="flex flex-col">
                            <span className="text-white">{movie.name}</span>
                            <div className="flex gap-1 mt-1">
                               {isNew && <span className="px-1.5 py-0.5 rounded-[3px] text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">New</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-gray-400">{movie.genre}</td>
                        <td className="py-3 text-gray-400">{movie.vj}</td>
                        <td className="py-3 text-right font-mono text-blue-300">{movie.views.toLocaleString()}</td>
                        <td className="py-3 pr-2 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link 
                              href={`/edit-movie/${movie.id}`}
                              className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded transition"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </Link>
                            <button 
                              onClick={() => initiateDelete(movie.id, movie.name)}
                              className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>

        {/* 3. Leaderboards Section (Moved Below Recent Uploads) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* VJ Leaderboard */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Users size={18} className="text-blue-400" /> VJ Leaderboard
            </h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="pb-3 pl-2">VJ Name</th>
                    <th className="pb-3 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {vjStats.map((vj, idx) => (
                    <tr key={vj.name} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3 pl-2 font-medium flex items-center gap-2">
                         <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${idx < 3 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700 text-gray-400'}`}>{idx + 1}</span>
                         {vj.name}
                      </td>
                      <td className="py-3 text-right font-mono text-blue-300">{vj.views.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Movies Leaderboard */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Star size={18} className="text-yellow-400" /> Top Movies
            </h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="pb-3 pl-2">Movie</th>
                    <th className="pb-3 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {topMovies.map((movie, idx) => (
                    <tr key={movie.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3 pl-2 flex items-center gap-3">
                         <span className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs ${idx < 3 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700 text-gray-400'}`}>{idx + 1}</span>
                         <div className="w-8 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={movie.thumbnail || "/placeholder.png"} 
                              alt={movie.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {e.target.src = "https://via.placeholder.com/100x150?text=No+Img"}} 
                            />
                         </div>
                         <div className="flex flex-col">
                           <span className="font-medium truncate max-w-[150px] text-white">{movie.name}</span>
                           <span className="text-xs text-gray-400">{movie.vj}</span>
                         </div>
                      </td>
                      <td className="py-3 text-right font-mono text-green-400">{movie.views.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Charts Section (Moved Below Tables) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Revenue by Package">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={packageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} cursor={{ fill: '#374151' }} />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Subscription Growth">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                <Line type="monotone" dataKey="subscribers" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* 5. Pie Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <ChartCard title="Package Distribution">
             <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={packageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="users"
                >
                  {packageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
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

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-gray-600 transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-gray-700/50 ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      {children}
    </div>
  );
}
