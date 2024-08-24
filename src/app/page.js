"use client";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Home() {
  const [summary, setSummary] = useState({
    customerCount: 0,
    orderCount: 0,
    receivedOrdersCount: 0,
    processingOrdersCount: 0,
    completedOrdersCount: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/get-summary");
        if (!response.ok) {
          throw new Error("Failed to fetch summary data");
        }
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
      router.push('/login'); // Redirect if not authenticated or not an admin
    }
  }, [status, session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const chartOptions = {
    labels: ["Received Orders", "Processing Orders", "Completed Orders"],
    chart: {
      type: "pie",
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "14px",
        fontFamily: "Helvetica, Arial, sans-serif",
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const chartSeries = [
    summary.receivedOrdersCount,
    summary.processingOrdersCount,
    summary.completedOrdersCount,
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-[87%] p-8 bg-gray-50 h-[100vh]">
        <h1 className="text-5xl font-bold mb-10 text-center text-blue-600">Admin Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Total Customers</h2>
            <p className="text-5xl font-bold mt-4 text-blue-600">{summary.customerCount}</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Total Orders</h2>
            <p className="text-5xl font-bold mt-4 text-blue-600">{summary.orderCount}</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Received Orders</h2>
            <p className="text-5xl font-bold mt-4 text-blue-600">{summary.receivedOrdersCount}</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Processing Orders</h2>
            <p className="text-5xl font-bold mt-4 text-blue-600">{summary.processingOrdersCount}</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Completed Orders</h2>
            <p className="text-5xl font-bold mt-4 text-blue-600">{summary.completedOrdersCount}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-6">Order Status Overview</h3>
          <ApexCharts
            options={chartOptions}
            series={chartSeries}
            type="pie"
            width="500"
          />
        </div>
      </div>
    </div>
  );
}
