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
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  const [year, setYear] = useState(prevMonth.getFullYear());
  const [month, setMonth] = useState(prevMonth.getMonth() + 1);
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    try {
      // 샘플 데이터 삽입
      const result = {
        month: "2025-05",
        totalSpending: 525300,
        categoryBreakdown: {
          "카페": 40000,
          "식비": 150000,
          "교통": 32300,
          "문화": 25000,
          "공과금": 40000,
          "의류": 250000,
        },
        categoryRatio: {
          "카페": 7.61,
          "식비": 28.56,
          "교통": 6.15,
          "문화": 4.76,
          "공과금": 7.61,
          "의류": 47.53,
        },
        monthBudget: 500000,
        budgetUsageRate: 105.06,
        weeklySpendingRate: [19.71, 0.0, 0.0, 23.93, 56.36],
        patternAnalysis:
          "5월 초에 카페와 식비 지출이 집중되어 있고, 5월 6일에 의류 항목으로 큰 지출이 발생했습니다. 공과금과 문화비, 교통비는 상대적으로 적은 편이며, 전체 지출 중 절반 가까이가 의류 쇼핑에 사용되었습니다. 주간별로 보면 첫째 주와 넷째 주에 지출이 가장 많이 발생한 경향이 있습니다.",
        feedback:
          "전체 예산 50만원을 소폭 초과하셨습니다. 특히 의류 쇼핑에서 큰 지출이 있었으므로, 다음 달에는 의류 지출을 계획적으로 조절하시고, 평소 작은 지출들이 누적되지 않도록 주의하시면 예산 내에서 소비 관리가 가능할 것입니다. 또한 주간별로 지출 분포를 고르게 하여 불필요한 과다 지출을 감소시키는 것도 도움이 됩니다.",
      };

      setReport({ summary: result });
    } catch (error) {
      console.error("리포트 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchReport();
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

  const pieColors = [
    "#8fd694",
    "#f6b94d",
    "#79a8f5",
    "#ccc",
    "#b4b4b4",
    "#f59f9f"
  ];

  const pieChartData = report
    ? Object.entries(report.summary.categoryBreakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const budgetData = report
    ? {
        total: report.summary.monthBudget ?? 0,
        used: report.summary.totalSpending ?? 0,
        remaining: (report.summary.monthBudget ?? 0) - (report.summary.totalSpending ?? 0),
        usageRate: report.summary.budgetUsageRate ?? 0,
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
          <button onClick={handlePrevMonth} style={styles.monthArrow}>&lt;</button>
          <h1 style={styles.monthText}>{year}년 {month}월</h1>
          <button onClick={handleNextMonth} style={styles.monthArrow}>&gt;</button>
        </div>

        <section style={styles.chartSection}>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
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
            <div
              style={{ ...styles.progressFill, width: `${budgetData.usageRate}%` }}
            >
              {budgetData.usageRate}%
            </div>
          </div>
          <p>총 예산:  {(budgetData.total).toLocaleString()}<span style={styles.unit}>(원)</span></p>
          <p>사용 금액:  {(budgetData.used).toLocaleString()}<span style={styles.unit}>(원)</span></p>
          <p>남은 금액:  {(budgetData.remaining).toLocaleString()}<span style={styles.unit}>(원)</span></p>
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
                  <CartesianGrid stroke="#ccc" strokeDasharray="3 3" vertical horizontal />
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
    // padding: "2rem",
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
    padding: "1.5rem 2rem",
    // marginBottom: "2rem",
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
    // paddingBottom: "1rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "320px",
    // marginBottom: "2rem",
  },
  reportSection: {
    textAlign: "left",
    marginTop: "2rem",
    padding : "0rem 2rem"
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
    // margin: "2rem calc(-50vw + 50%)",
  },
};
