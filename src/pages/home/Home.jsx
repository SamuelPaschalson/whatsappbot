import React from "react";
import Chart from "../../components/chart/Chart";
import FeaturedInfo from "../../components/featuredInfo/FeaturedInfo";
import "./home.css";
import { userData } from "../../dummyData";
import WidgetSm from "../../components/widgetSm/WidgetSm";
import WidgetLg from "../../components/widgetLg/WidgetLg";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function Home() {
  const MONTHS = useMemo(
    () => [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    []
  );

  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState({ start: "", end: "" });

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("http://localhost:8800/api/users/stats", {
          headers: {
            token: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFmMjFiNDc1LTc5NmMtNDk4Yy1iNDc2LTFhODRmYjBiODRmMyIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc1Mjg1MDM3OCwiZXhwIjoxNzUzMjgyMzc4fQ.rXr2f3VvoAkIhTifOVjY88tXplVdAbNgFq1DZXqNS_A`,
          },
        });

        // Handle the new response structure
        if (res.data.success) {
          const { stats, period } = res.data.data;

          // Set the period information
          setPeriod({
            start: new Date(period.start).toLocaleDateString(),
            end: new Date(period.end).toLocaleDateString(),
          });

          // Sort and format stats
          const sortedStats = stats.sort((a, b) => a._id - b._id);
          const formattedStats = sortedStats.map((item) => ({
            name: MONTHS[item._id - 1],
            "New Users": item.total,
          }));

          // Fill in missing months with zero values
          const completeStats = Array.from({ length: 12 }, (_, i) => {
            const existingMonth = formattedStats.find(
              (item) => item.name === MONTHS[i]
            );
            return (
              existingMonth || {
                name: MONTHS[i],
                "New Users": 0,
              }
            );
          });

          setUserStats(completeStats);
        }
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
        setError("Failed to load user statistics");
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, [MONTHS]);

  return (
    <div className="home">
      <FeaturedInfo periodStart={period.start} periodEnd={period.end} />

      {loading ? (
        <div className="loading">Loading user analytics...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="chart-container">
            <Chart
              data={userStats}
              title="User Signups by Month"
              grid
              dataKey="New Users"
            />
          </div>

          <div className="homeWidgets">
            <WidgetSm />
            <WidgetLg />
          </div>
        </>
      )}
    </div>
  );
}
