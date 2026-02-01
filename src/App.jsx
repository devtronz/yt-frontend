import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { useState } from "react";
import axios from "axios";

/* =========================
   Chart.js Registration
========================= */
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

  /* =========================
     Earnings Estimator
  ========================= */
  const estimateEarnings = (views) => {
    const lowCPM = 0.5;
    const highCPM = 5;

    return {
      low: ((views / 1000) * lowCPM).toFixed(2),
      high: ((views / 1000) * highCPM).toFixed(2)
    };
  };

  /* =========================
     Growth Prediction
  ========================= */
  const predictGrowth = (subs) => {
    return {
      min: Math.floor(subs * 0.01),
      max: Math.floor(subs * 0.03)
    };
  };

  /* =========================
     Chart Data (FIXED)
  ========================= */
  const chartData = channel
    ? {
        labels: ["Subscribers", "Views", "Videos"],
        datasets: [
          {
            label: "Channel Stats",
            data: [
              Number(channel.subscribers),
              Number(channel.views),
              Number(channel.videos)
            ],
            backgroundColor: [
              "#ef4444",
              "#3b82f6",
              "#22c55e"
            ]
          }
        ]
      }
    : null;

  /* =========================
     Fetch Data
  ========================= */
  const analyze = async () => {
    if (!query) return;

    setLoading(true);
    setChannel(null);
    setVideos([]);

    try {
      const channelRes = await axios.get(
        `${API_BASE}/api/channel?query=${query}`
      );

      const videosRes = await axios.get(
        `${API_BASE}/api/videos?query=${query}`
      );

      setChannel(channelRes.data);
      setVideos(videosRes.data);
    } catch (err) {
      alert("Channel not found or API error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        📊 YouTube Analyzer
      </h1>

      {/* Search */}
      <div className="flex justify-center gap-2 mb-8">
        <input
          className="px-4 py-2 rounded bg-slate-800 w-72 outline-none"
          placeholder="@channel / URL / name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={analyze}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Analyze
        </button>
      </div>

      {loading && (
        <p className="text-center text-slate-400">Loading...</p>
      )}

      {/* Channel Card */}
      {channel && (
        <div className="max-w-4xl mx-auto bg-slate-800 p-6 rounded-lg mb-6">
          <div className="flex gap-4 items-center">
            <img
              src={channel.thumbnail}
              className="w-24 h-24 rounded-full"
              alt="Channel"
            />
            <div>
              <h2 className="text-2xl font-semibold">
                {channel.title}
              </h2>
              <p className="text-slate-400 text-sm">
                {channel.description?.slice(0, 140)}...
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div className="bg-slate-900 p-3 rounded">
              <p className="text-xl font-bold">
                {Number(channel.subscribers).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Subscribers</p>
            </div>

            <div className="bg-slate-900 p-3 rounded">
              <p className="text-xl font-bold">
                {Number(channel.views).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Views</p>
            </div>

            <div className="bg-slate-900 p-3 rounded">
              <p className="text-xl font-bold">
                {Number(channel.videos).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Videos</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Analytics */}
      {channel && chartData && (
        <div className="max-w-4xl mx-auto bg-slate-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">
            📊 Channel Analytics
          </h3>

          <div className="h-[300px]">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Earnings */}
      {channel && (
        <div className="max-w-4xl mx-auto bg-slate-800 p-6 rounded-lg mb-8 text-center">
          <h3 className="text-lg font-semibold mb-4">
            💰 Estimated Earnings
          </h3>
          {(() => {
            const e = estimateEarnings(
              Number(channel.views)
            );
            return (
              <p className="text-2xl font-bold text-green-400">
                ${e.low} – ${e.high}
              </p>
            );
          })()}
          <p className="text-xs text-slate-400 mt-2">
            CPM based estimation ($0.5 – $5)
          </p>
        </div>
      )}

      {/* Growth */}
      {channel && (
        <div className="max-w-4xl mx-auto bg-slate-800 p-6 rounded-lg mb-8 text-center">
          <h3 className="text-lg font-semibold mb-4">
            📈 30-Day Growth Prediction
          </h3>
          {(() => {
            const g = predictGrowth(
              Number(channel.subscribers)
            );
            return (
              <p className="text-xl font-bold text-blue-400">
                +{g.min.toLocaleString()} to +{g.max.toLocaleString()} subscribers
              </p>
            );
          })()}
          <p className="text-xs text-slate-400 mt-2">
            Estimated growth range
          </p>
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((v) => (
            <a
              key={v.videoId}
              href={`https://youtube.com/watch?v=${v.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800 p-3 rounded hover:bg-slate-700"
            >
              <img
                src={v.thumbnail}
                className="rounded mb-2"
                alt="Video"
              />
              <p className="text-sm">{v.title}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
