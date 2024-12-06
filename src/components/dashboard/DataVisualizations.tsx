import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Production", value: 20 },
  { name: "Maintenance", value: 15 },
  { name: "Logistique", value: 10 },
  { name: "Qualité", value: 8 },
];

export const DataVisualizations = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Soumissions par Département</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#276955" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};