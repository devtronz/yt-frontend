import { useState } from "react";
import axios from "axios";

const API_BASE = "https://youtube-backend-1m6l.onrender.com";

export default function App() {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!query) return;
    setLoading(true);
    setError("");
    setChannel(null);
    setVideos([]);

    try {
      const ch = await axios.get(`${API_BASE}/api/channel?query=${query}`);
      const vd = await axios.get(`${API_BASE}/api/videos?query=${query}`);

      setChannel(ch.data);
      setVideos(Array.isArray(vd.data) ? vd.data : []);
    } catch {
      setError("Failed to fetch channel data");
    }

    setLoading(false);
  };

  const subs = Number(channel?.subscribers) || 0;
  const views = Number(channel?.views) || 0;
  const vids = Number(channel?.videos) || 0;

  const avgViews = vids ? Math.round(views / vids) : 0;
  const subsPerVideo = vids ? Math.round(subs / vids) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        📊 YouTube Analyzer
      </h1>

      {/* SEARCH */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 mb-8">
        <input
          className="px-4 py-3 rounded bg-slate-800 w-full sm:w-96 outline-none"
          placeholder="@channel / URL / name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={analyze}
          className="bg-red-600 px-6 py-3 rounded hover:bg-red-700"
        >
          Analyze
        </button>
      </div>

      {loading && <p className="text-center text-slate-400">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {/* CHANNEL INFO */}
      {channel && (
        <>
          <div className="max-w-4xl mx-auto bg-slate-900 p-6 rounded-xl mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img
                src={channel.thumbnail}
                className="w-24 h-24 rounded-full"
                alt=""
              />
              <div>
                <h2 className="text-2xl font-semibold">{channel.title}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {channel.description || "No description available"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <Stat label="Subscribers" value={subs} />
              <Stat label="Total Views" value={views} />
              <Stat label="Total Videos" value={vids} />
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Insight label="Avg Views / Video" value={avgViews} />
            <Insight label="Subs / Video" value={subsPerVideo} />
            <Insight label="Channel Health" value="Good 👍" />
          </div>
        </>
      )}

      {/* VIDEO TABLE */}
      {videos.length > 0 && (
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-xl overflow-hidden">
          <h2 className="text-xl font-semibold px-6 py-4 border-b border-slate-700">
            📋 Last 10 Videos Performance
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left">Video</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">Comments</th>
                  <th className="px-4 py-3">Published</th>
                </tr>
              </thead>

              <tbody>
                {videos.slice(0, 10).map((v) => (
                  <tr key={v.videoId} className="border-t border-slate-700">
                    <td className="px-4 py-3 flex gap-3 items-center min-w-[280px]">
                      <img src={v.thumbnail} className="w-16 h-10 rounded" />
                      <a
                        href={`https://youtube.com/watch?v=${v.videoId}`}
                        target="_blank"
                        className="hover:text-red-400 line-clamp-2"
                      >
                        {v.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {Number(v.views).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-green-400">
                      {Number(v.likes || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-blue-400">
                      {Number(v.comments || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {new Date(v.publishedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Stat({ label, value }) {
  return (
    <div className="bg-slate-800 p-5 rounded-lg text-center">
      <p className="text-2xl font-bold">{Number(value).toLocaleString()}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Insight({ label, value }) {
  return (
    <div className="bg-slate-800 p-5 rounded-lg text-center">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
