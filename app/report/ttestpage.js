"use client";

import TopBar from "@/components/TopBar";
import Navbar from "@/components/NavBar";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export default function ReportPage() {
  const userId = 123;
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  const [year, setYear] = useState(prevMonth.getFullYear());
  const [month, setMonth] = useState(prevMonth.getMonth() + 1);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadOrCreateReport = async () => {
      try {
        const monthStr = `${year}-${String(month).padStart(2, "0")}`;

        const getRes = await fetch(`/api/reports/${userId}/${monthStr}`);
        if (getRes.ok) {
          const data = await getRes.json();
          setReport(data);
        } else if (getRes.status === 404) {
          const postRes = await fetch(`/api/reports/${userId}/${monthStr}?budget=500000`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!postRes.ok) throw new Error("리포트 생성 실패");
          const created = await postRes.json();
          setReport(created);
        } else {
          throw new Error(`에러 코드 ${getRes.status}`);
        }
      } catch (err) {
        console.error("리포트 로딩 실패:", err);
      }
    };

    loadOrCreateReport();
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((prev) => prev + 1);
      setMonth(1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const pieColors = ["#8fd694", "#f6b94d", "#79a8f5", "#ccc"];

  const pieChartData = report?.summary?.spendingByCategory
    ? Object.entries(report.summary.spendingByCategory).map(([name, value]) => ({ name, value }))
    : [];

  const budgetData = report?.summary
    ? {
        total: 500000,
        used: report.summary.totalSpending,
        remaining: 500000 - report.summary.totalSpending,
        usageRate: report.summary.budgetUsageRate,
      }
    : { total: 0, used: 0, remaining: 0, usageRate: 0 };

  const weeklySpendingData = report?.summary?.weeklySpendingRate
    ? report.summary.weeklySpendingRate.map((rate, i) => ({
        name: `${i + 1}주차`,
        value: rate,
      }))
    : [];

  return (
    <>
      <TopBar />
      <main style={styles.main}>
        <div style={styles.monthNav}>
          <button onClick={handlePrevMonth} style={styles.monthArrow}>
            &lt;
          </button>
          <h1 style={styles.monthText}>
            {year}년 {month}월
          </h1>
          <button onClick={handleNextMonth} style={styles.monthArrow}>
            &gt;
          </button>
        </div>

        <section style={styles.chartSection}>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div style={styles.divider}></div>

        <section style={styles.budgetSection}>
          <h2 style={styles.budgetTitle}>예산 대비 지출</h2>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${budgetData.usageRate}%` }}>
              {budgetData.usageRate}%
            </div>
          </div>
          <p>
            총 예산: -{budgetData.total.toLocaleString()}
            <span style={styles.unit}>(원)</span>
          </p>
          <p>
            사용 금액: -{budgetData.used.toLocaleString()}
            <span style={styles.unit}>(원)</span>
          </p>
          <p>
            남은 금액: -{budgetData.remaining.toLocaleString()}
            <span style={styles.unit}>(원)</span>
          </p>
        </section>

        <div style={styles.divider}></div>

        {report && (
          <section style={styles.reportSection}>
            <h2 style={styles.budgetTitle}>분석 리포트 요약</h2>
            <div style={styles.reportChart}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={weeklySpendingData}
                  margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
                  barSize={20}
                  barCategoryGap="20%"
                >
                  <CartesianGrid stroke="#ccc" strokeDasharray="3 3" vertical={true} horizontal={true} />
                  <XAxis dataKey="name" interval={0} />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <ReferenceLine y={25} stroke="#f19209" strokeWidth={1} />
                  <Bar dataKey="value" fill="#F5B56B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={styles.reportSummary}>{report.summary.patternAnalysis}</p>
            <p style={styles.reportSubText}>{report.summary.feedback}</p>
          </section>
        )}
      </main>
      <Navbar />
    </>
  );
}


const styles = {
  main: {
    fontFamily: "sans-serif",
    padding: "2rem",
    background: "#fff",
    color: "#444",
    maxWidth: "480px",
    margin: "0 auto",
  },
  monthNav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    color: "#F5B56B",
  },
  monthText: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#F5B56B",
  },
  monthArrow: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#F5B56B",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  budgetSection: {
    padding: "1.5rem 0",
    marginBottom: "2rem",
  },
  budgetTitle: {
    fontSize: "1.25rem",
    color: "#f19209",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  progressBar: {
    backgroundColor: "#ddd",
    borderRadius: "20px",
    height: "24px",
    marginBottom: "1rem",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F5B56B",
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  unit: {
    fontSize: "0.8rem",
    color: "#999",
  },
  chartSection: {
    paddingTop: "1rem",
    paddingBottom: "1rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "320px",
    marginBottom: "2rem",
  },
  reportSection: {
    textAlign: "left",
    marginTop: "2rem",
  },
  reportChart: {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto 1rem",
    height: "200px",
  },
  reportSummary: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginBottom: "0.8rem",
  },
  reportSubText: {
    fontSize: "0.95rem",
    color: "#444",
  },
  divider: {
    width: "100vw",
    height: "1px",
    backgroundColor: "#ccc",
    margin: "2rem calc(-50vw + 50%)",
  },
};