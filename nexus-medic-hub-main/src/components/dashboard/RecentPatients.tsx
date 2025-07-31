import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Patient } from "@/types/patient";

interface RecentPatientsProps {
  patients: Patient[];
}

const getStatusColor = (status: Patient["current_status"]) => {
  switch (status) {
    case "stable":
      return "bg-green-100 text-green-800";
    case "critical":
      return "bg-red-100 text-red-800";
    case "improving":
      return "bg-blue-100 text-blue-800";
    case "observation":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const RecentPatients = ({ patients }: RecentPatientsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Admission Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Diagnosis</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.patient_id} className="border-b border-muted patient-row">
                  <td className="px-4 py-3 text-sm font-medium">{patient.patient_id}</td>
                  <td className="px-4 py-3 text-sm">{`${patient.first_name} ${patient.last_name}`}</td>
                  <td className="px-4 py-3 text-sm">{patient.age}</td>
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(patient.admission_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant="secondary" className={patient.current_status ? getStatusColor(patient.current_status) : ""}>
                      {patient.current_status || "Unknown"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{patient.current_diagnosis || "No diagnosis"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
