"use client";

import { useState } from "react";
import {
  Map,
  Users,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  MoreHorizontal,
  Search,
  Bell,
  ChevronDown,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const requestsData = [
  { day: "Mon", requests: 18400 },
  { day: "Tue", requests: 22100 },
  { day: "Wed", requests: 19800 },
  { day: "Thu", requests: 31200 },
  { day: "Fri", requests: 28700 },
  { day: "Sat", requests: 14300 },
  { day: "Sun", requests: 11900 },
];

const statesData = [
  { state: "Uttar Pradesh", villages: 107106 },
  { state: "Madhya Pradesh", villages: 54903 },
  { state: "Odisha", villages: 51478 },
  { state: "Bihar", villages: 44937 },
  { state: "Maharashtra", villages: 43946 },
];

const users = [
  {
    id: 1,
    company: "Swiggy Logistics",
    email: "api@swiggy.in",
    apiKey: "igapi_7e6f2c••••••••••de91",
    plan: "Pro",
    status: "Active",
    requests: "298,412",
  },
  {
    id: 2,
    company: "Zomato India",
    email: "dev@zomato.com",
    apiKey: "igapi_3a9b1d••••••••••f204",
    plan: "Unlimited",
    status: "Active",
    requests: "891,033",
  },
  {
    id: 3,
    company: "Delhivery Corp",
    email: "tech@delhivery.com",
    apiKey: "igapi_c2e4a8••••••••••7731",
    plan: "Premium",
    status: "Active",
    requests: "44,218",
  },
  {
    id: 4,
    company: "Flipkart Commerce",
    email: "infra@flipkart.com",
    apiKey: "igapi_9f1c3b••••••••••a556",
    plan: "Unlimited",
    status: "Active",
    requests: "1,204,891",
  },
  {
    id: 5,
    company: "Urban Company",
    email: "backend@urbancompany.com",
    apiKey: "igapi_5d8e2f••••••••••3bc0",
    plan: "Free",
    status: "Pending",
    requests: "1,240",
  },
  {
    id: 6,
    company: "Meesho Inc",
    email: "api@meesho.com",
    apiKey: "igapi_b4a7c1••••••••••6d83",
    plan: "Premium",
    status: "Suspended",
    requests: "12,004",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

const planColors: Record<string, string> = {
  Free: "bg-gray-100 text-gray-600",
  Premium: "bg-blue-50 text-blue-700",
  Pro: "bg-violet-50 text-violet-700",
  Unlimited: "bg-amber-50 text-amber-700",
};

const statusColors: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-yellow-50 text-yellow-700",
  Suspended: "bg-red-50 text-red-600",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="font-semibold text-gray-900">
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      u.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── TOP NAV ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Map className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">India Geo API</span>
              <span className="text-gray-300 text-xs ml-1">/</span>
              <span className="text-gray-500 text-xs">Admin</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {["Overview", "Users", "API Logs", "Settings"].map((item) => (
                <button
                  key={item}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    item === "Overview"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-indigo-700">A</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform overview · Last updated just now
          </p>
        </div>

        {/* ── METRIC CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Villages */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Villages</span>
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Map className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">450K+</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">29 states covered</span>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Users</span>
              <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">1,284</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+12% this week</span>
            </div>
          </div>

          {/* API Requests */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">API Requests Today</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">2.4M</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+8.3% vs yesterday</span>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Response Time</span>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">47ms</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">Well below 100ms SLA</span>
            </div>
          </div>

        </div>

        {/* ── CHARTS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">

          {/* Line Chart — takes 3 cols */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">API Requests</h2>
                <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-600">Live</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={requestsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart — takes 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900">Top States</h2>
              <p className="text-xs text-gray-500 mt-0.5">By village count</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statesData} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="state"
                  width={90}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.split(" ")[0]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="villages" fill="#e0e7ff" radius={[0, 4, 4, 0]}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* ── USER TABLE ── */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">B2B Clients</h2>
              <p className="text-xs text-gray-500 mt-0.5">{users.length} registered companies</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 w-48 bg-gray-50"
                />
              </div>
              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {["all", "active", "pending", "suspended"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Company", "Email", "API Key", "Plan", "Requests", "Status", ""].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-indigo-700">
                            {user.company[0]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {user.apiKey}
                      </code>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${planColors[user.plan]}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-gray-700 font-medium tabular-nums">{user.requests}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[user.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "Active" ? "bg-emerald-500" :
                          user.status === "Pending" ? "bg-yellow-500" : "bg-red-400"
                        }`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No users match your filters</p>
              </div>
            )}
          </div>

          {/* Table footer */}
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <div className="flex items-center gap-1">
              {["Previous", "Next"].map((label) => (
                <button
                  key={label}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}