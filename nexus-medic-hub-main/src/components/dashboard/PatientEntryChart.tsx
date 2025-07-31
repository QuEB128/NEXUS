
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PatientEntry {
  day: string;
  count: number;
}

interface PatientEntryChartProps {
  data?: PatientEntry[];
}

export const PatientEntryChart = ({ data = [] }: PatientEntryChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Patient Data Entry (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e58c8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1e58c8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #e1efff",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#1e58c8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
