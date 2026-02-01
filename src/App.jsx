import { useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

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

      setChannel(ch.data || null);
      setVideos(Array.isArray(vd.data) ? vd.data : []);
    } catch {
      setError("Failed to fetch channel data");
    }

    setLoading(false);
  };

  /* ---------- SAFE VALUES ---------- */
  const subs = Number(channel?.subscribers) || 0;
  const views = Number(channel?.views) || 0;
  const vids = Number(channel?.videos) || 0;

  const avgViews = vids > 0 ? Math.round(views / vids) : 0;
  const subsPerVideo = vids > 0 ? Math.round(subs / vids) : 0;

  const healthScore = Math.min(
    100,
    Math.round(avgViews / 1000 + subsPerVideo / 50 + vids / 10)
  );

  const topVideos = videos
    .filter(v => Number(v.views) > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  /* ---------- NORMALIZED CHART DATA ---------- */
  const chartData =
    subs + views + vids > 0
      ? {
          labels: ["Subscribers", "Views", "Videos"],
          datasets: [
            {
              data: [
                Math.max(subs / 1000, 1),
                Math.max(views / 100000, 1),
                Math.max(vids * 10, 1)
              ],
              backgroundColor: ["#ef4444", "#3b82f6", "#22c55e"]
            }
          ]
        }
      : null;

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

      {loading && (
        <p className="text-center text-slate-400">Loading...</p>
      )}
      {error && (
        <p className="text-center text-red-400">{error}</p>
      )}

      {/* CHANNEL CARD */}
      {channel && (
        <div className="max-w-4xl mx-auto bg-slate-900 p-6 rounded-xl mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <img
              src={channel.thumbnail}
              className="w-24 h-24 rounded-full"
              alt=""
            />
            <div>
              <h2 className="text-2xl font-semibold">
                {channel.title}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {channel.description || "No description available"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <Stat label="Subscribers" value={subs} />
            <Stat label="Views" value={views} />
            <Stat label="Videos" value={vids} />
          </div>
        </div>
      )}

      {/* CHART */}
      {chartData && (
        <div className="max-w-4xl mx-auto bg-slate-900 p-6 rounded-xl mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">
            📈 Channel Analytics
          </h3>
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const i = ctx.dataIndex;
                        if (i === 0) return `${subs.toLocaleString()} subs`;
                        if (i === 1) return `${views.toLocaleString()} views`;
                        return `${vids} videos`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* INSIGHTS */}
      {channel && (
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4 mb-6">
          <Insight label="Avg Views / Video" value={avgViews} />
          <Insight label="Subs / Video" value={subsPerVideo} />
          <Insight label="Health Score" value={`${healthScore} / 100`} />
        </div>
      )}

      {/* TOP VIDEOS */}
      {topVideos.length > 0 && (
        <div className="max-w-4xl mx-auto bg-slate-900 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">
            🔥 Top Performing Videos
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {topVideos.map((v) => (
              <a
                key={v.videoId}
                href={`https://youtube.com/watch?v=${v.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 p-3 rounded hover:bg-slate-700"
              >
                <img src={v.thumbnail} className="rounded mb-2" />
                <p className="text-sm">{v.title}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {Number(v.views).toLocaleString()} views
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Stat({ label, value }) {
  return (
    <div className="bg-slate-800 p-4 rounded">
      <p className="text-xl font-bold">
        {Number(value).toLocaleString()}
      </p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function Insight({ label, value }) {
  return (
    <div className="bg-slate-900 p-4 rounded text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
