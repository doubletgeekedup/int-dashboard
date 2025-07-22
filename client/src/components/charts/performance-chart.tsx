import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3
} from "lucide-react";
import type { PerformanceMetric } from "@shared/schema";

interface PerformanceChartProps {
  sourceCode?: string;
  metrics?: PerformanceMetric[];
  className?: string;
}

type ChartType = "line" | "area" | "bar";
type MetricType = "response-time" | "throughput" | "error-rate" | "uptime";

export function PerformanceChart({ sourceCode, metrics: providedMetrics, className }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [metricType, setMetricType] = useState<MetricType>("response-time");
  const [timeRange, setTimeRange] = useState("7days");

  // Fetch metrics if not provided
  const { data: fetchedMetrics = [], isLoading } = useQuery<PerformanceMetric[]>({
    queryKey: ["/api/sources", sourceCode, "metrics", metricType, timeRange],
    queryFn: async () => {
      if (!sourceCode) return [];
      
      const params = new URLSearchParams({
        type: metricType,
        limit: timeRange === "7days" ? "168" : timeRange === "30days" ? "720" : "2160"
      });
      
      const response = await fetch(`/api/sources/${sourceCode}/metrics?${params}`);
      return response.json();
    },
    enabled: !!sourceCode && !providedMetrics,
  });

  const metrics = providedMetrics || fetchedMetrics;

  // Transform metrics data for charts
  const chartData = metrics
    .filter(m => m.metricType === metricType)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((metric, index) => ({
      timestamp: new Date(metric.timestamp).toLocaleDateString(),
      time: new Date(metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: metric.value,
      unit: metric.unit,
      index,
    }))
    .slice(-50); // Show last 50 data points

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { direction: "stable", percentage: 0 };
    
    const recent = chartData.slice(-10);
    const previous = chartData.slice(-20, -10);
    
    if (previous.length === 0) return { direction: "stable", percentage: 0 };
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.value, 0) / previous.length;
    
    const percentage = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      direction: percentage > 5 ? "up" : percentage < -5 ? "down" : "stable",
      percentage: Math.abs(percentage).toFixed(1),
    };
  };

  const trend = calculateTrend();

  // Get metric display info
  const getMetricInfo = () => {
    switch (metricType) {
      case "response-time":
        return { label: "Response Time", color: "#3b82f6", unit: "ms" };
      case "throughput":
        return { label: "Throughput", color: "#10b981", unit: "req/s" };
      case "error-rate":
        return { label: "Error Rate", color: "#ef4444", unit: "%" };
      case "uptime":
        return { label: "Uptime", color: "#8b5cf6", unit: "%" };
      default:
        return { label: "Metric", color: "#6b7280", unit: "" };
    }
  };

  const metricInfo = getMetricInfo();

  if (isLoading) {
    return (
      <div className={`chart-container chart-placeholder ${className}`}>
        <div className="text-center">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`chart-container chart-placeholder ${className}`}>
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium text-muted-foreground mb-1">No Data Available</p>
          <p className="text-sm text-muted-foreground">
            {sourceCode 
              ? `No ${metricInfo.label.toLowerCase()} data found for ${sourceCode}`
              : "Connect to a data source to view performance metrics"
            }
          </p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricInfo.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metricInfo.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${metricInfo.unit}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [`${value}${metricInfo.unit}`, metricInfo.label]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metricInfo.color}
              fillOpacity={1}
              fill="url(#colorMetric)"
              strokeWidth={2}
            />
          </AreaChart>
        );
      
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${metricInfo.unit}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [`${value}${metricInfo.unit}`, metricInfo.label]}
            />
            <Bar dataKey="value" fill={metricInfo.color} radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${metricInfo.unit}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => [`${value}${metricInfo.unit}`, metricInfo.label]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={metricInfo.color}
              strokeWidth={2}
              dot={{ fill: metricInfo.color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: metricInfo.color, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  const TrendIcon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const trendColor = trend.direction === "up" 
    ? (metricType === "error-rate" ? "text-red-600" : "text-green-600") 
    : trend.direction === "down" 
    ? (metricType === "error-rate" ? "text-green-600" : "text-red-600")
    : "text-gray-600";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Select value={metricType} onValueChange={(value: MetricType) => setMetricType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="response-time">Response Time</SelectItem>
              <SelectItem value="throughput">Throughput</SelectItem>
              <SelectItem value="error-rate">Error Rate</SelectItem>
              <SelectItem value="uptime">Uptime</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Trend Indicator */}
          <div className={`flex items-center space-x-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{trend.percentage}%</span>
          </div>
          
          {/* Current Value */}
          <Badge variant="outline">
            Latest: {chartData[chartData.length - 1]?.value}{metricInfo.unit}
          </Badge>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded" 
            style={{ backgroundColor: metricInfo.color }}
          />
          <span>{metricInfo.label}</span>
        </div>
        <span>•</span>
        <span>{chartData.length} data points</span>
        {sourceCode && (
          <>
            <span>•</span>
            <span>Source: {sourceCode}</span>
          </>
        )}
      </div>
    </div>
  );
}
