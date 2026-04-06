import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Sumita from "./Sumita";
import { getEarnings } from "../lib/api";

// Formats a Unix ms timestamp to "HH:MM" for the X axis.
function toHourLabel(ms) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

// Buckets a flat list of transactions into hourly data points.
// Each bucket: { time: "HH:MM", earned: number, count: number }
function bucketByHour(transactions) {
  if (!transactions.length) return [];

  // Build a map keyed by hour-bucket epoch (floored to the hour)
  const buckets = new Map();

  transactions.forEach((tx) => {
    const hourMs = Math.floor(tx.created_at / 3_600_000) * 3_600_000;
    const existing = buckets.get(hourMs) ?? { time: toHourLabel(hourMs), earned: 0, count: 0 };
    existing.earned = parseFloat((existing.earned + parseFloat(tx.amount)).toFixed(7));
    existing.count += 1;
    buckets.set(hourMs, existing);
  });

  // Return sorted ascending by time
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([, v]) => v);
}

// Custom tooltip card rendered by Recharts
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1.5px solid #FFD6E0",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <p style={{ margin: 0, fontSize: 12, color: "#6B6B6B", marginBottom: 4 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#6B3FA0" }}>
        {payload[0].value.toFixed(4)} USDC
      </p>
    </div>
  );
}

/**
 * EarningsChart — hourly USDC earnings line chart.
 *
 * Props:
 *   apiId   string | undefined   if provided, scopes to that wrapped API
 *   pollMs  number               re-fetch interval in ms (default 10 000)
 */
export default function EarningsChart({ apiId, pollMs = 10_000 }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchData() {
    try {
      const json = await getEarnings(apiId);
      setChartData(bucketByHour(json.transactions ?? []));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, pollMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiId]);

  // Loading skeleton
  if (loading) {
    return (
      <div
        style={{
          height: 220,
          backgroundColor: "#F3EEFF",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sumita
          pose="think"
          message="Hang tight... loading your earnings chart."
          size="sm"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#FFE0E0",
          borderRadius: 16,
          padding: "16px 20px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: "#B33A3A",
        }}
      >
        Could not load chart: {error}
      </div>
    );
  }

  // Empty state
  if (!chartData.length) {
    return (
      <div
        style={{
          padding: "40px 0",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          border: "2px dashed #FFD6E0",
        }}
      >
        <Sumita
          pose="think"
          message="No earnings yet — but they're coming. Share your endpoint and watch the magic happen!"
          size="md"
        />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#C9B8FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#C9B8FF" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="4 4"
          stroke="#FFD6E0"
          vertical={false}
        />

        <XAxis
          dataKey="time"
          tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#6B6B6B" }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />

        <YAxis
          tickFormatter={(v) => `${v.toFixed(3)}`}
          tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#6B6B6B" }}
          axisLine={false}
          tickLine={false}
          width={54}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#C9B8FF", strokeWidth: 1 }} />

        <Area
          type="monotone"
          dataKey="earned"
          stroke="#6B3FA0"
          strokeWidth={2.5}
          fill="url(#earningsGradient)"
          dot={{ fill: "#6B3FA0", r: 4, strokeWidth: 0 }}
          activeDot={{ fill: "#6B3FA0", r: 6, strokeWidth: 2, stroke: "#FFFFFF" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
