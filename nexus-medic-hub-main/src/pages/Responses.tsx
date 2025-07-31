
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Plus, Eye, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexus-medi-backend.onrender.com/api/v1';

const Responses = () => {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openReportId, setOpenReportId] = useState(null);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis_name: '',
    diagnosis_code: '',
    diagnosis_description: '',
    severity: '',
    status: 'active'
  });
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
    fetchPatients();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/reports`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.data || []);
        const map = {};
        (data.data || []).forEach((p) => {
          map[p.patient_id] = `${p.first_name} ${p.last_name}`;
        });
        setPatientMap(map);
      }
    } catch (err) {
      // ignore
    }
  };

  const createDiagnosis = async (patientId, reportId) => {
    setDiagnosisLoading(true);
    setDiagnosisError('');
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${patientId}/diagnoses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...diagnosisForm,
          created_by: user?.id,
          report_id: reportId
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiagnosisForm({
          diagnosis_name: '',
          diagnosis_code: '',
          diagnosis_description: '',
          severity: '',
          status: 'active'
        });
        setShowDiagnosisForm(false);
        alert('Diagnosis created successfully!');
        fetchReports(); // Refresh reports after responding
      } else {
        setDiagnosisError(data.error || 'Failed to create diagnosis');
      }
    } catch (err) {
      setDiagnosisError('Error creating diagnosis');
    } finally {
      setDiagnosisLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Responses & Diagnosis</h1>
          <p className="text-muted-foreground">
            Manage communications between patients and Nexus Robo to diagnose
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search communications..."
              className="w-full md:w-[240px] pl-8"
            />
          </div>
          <Button className="bg-medical-500 hover:bg-medical-600">
            <Plus className="mr-1 h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Reports</h2>
        {loading ? (
          <div>Loading reports...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : reports.length === 0 ? (
          <div>No reports found.</div>
        ) : (
          <ul className="space-y-4">
            {reports.filter(r => r.status !== 'Responded').map((report) => (
              <li key={report.report_id} className="border rounded p-4 relative">
                <div className="font-semibold">{patientMap[report.patient_id] || 'Unknown Patient'}</div>
                <div className="text-xs text-muted-foreground mb-1">Status: {report.status || 'Not Responded'} | Confidential: {report.isconfidential ? 'Yes' : 'No'} | By: {report.created_by || 'N/A'}</div>
                <div className="text-sm text-muted-foreground mb-2">{report.created_at ? new Date(report.created_at).toLocaleString() : ''}</div>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                  onClick={() => setOpenReportId(report.report_id)}
                >
                  <Eye className="h-4 w-4 mr-1 inline" /> View Report
                </Button>
                {/* Report Popup */}
                {openReportId === report.report_id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setOpenReportId(null);
                          setShowDiagnosisForm(false);
                          setDiagnosisError('');
                        }}
                        aria-label="Close"
                      >
                        ×
                      </button>
                      <h3 className="text-lg font-bold mb-4">Report</h3>
                      <div className="whitespace-pre-wrap text-base mb-6">{report.report_summary || 'No summary.'}</div>
                      
                      {/* Diagnosis Form Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold flex items-center">
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Create Diagnosis
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDiagnosisForm(!showDiagnosisForm)}
                          >
                            {showDiagnosisForm ? 'Hide Form' : 'Show Form'}
                          </Button>
                        </div>
                        
                        {showDiagnosisForm && (
                          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="diagnosis_name">Diagnosis Name *</Label>
                                <Input
                                  id="diagnosis_name"
                                  value={diagnosisForm.diagnosis_name}
                                  onChange={(e) => setDiagnosisForm(prev => ({ ...prev, diagnosis_name: e.target.value }))}
                                  placeholder="Enter diagnosis name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="diagnosis_code">Diagnosis Code</Label>
                                <Input
                                  id="diagnosis_code"
                                  value={diagnosisForm.diagnosis_code}
                                  onChange={(e) => setDiagnosisForm(prev => ({ ...prev, diagnosis_code: e.target.value }))}
                                  placeholder="Enter diagnosis code"
                                />
                              </div>
                              <div>
                                <Label htmlFor="severity">Severity</Label>
                                <Select
                                  value={diagnosisForm.severity}
                                  onValueChange={(value) => setDiagnosisForm(prev => ({ ...prev, severity: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mild">Mild</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="severe">Severe</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="diagnosis_description">Description</Label>
                              <Textarea
                                id="diagnosis_description"
                                value={diagnosisForm.diagnosis_description}
                                onChange={(e) => setDiagnosisForm(prev => ({ ...prev, diagnosis_description: e.target.value }))}
                                placeholder="Enter diagnosis description"
                                rows={3}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select
                                value={diagnosisForm.status}
                                onValueChange={(value) => setDiagnosisForm(prev => ({ ...prev, status: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {diagnosisError && (
                              <div className="text-red-500 text-sm">{diagnosisError}</div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowDiagnosisForm(false);
                                  setDiagnosisError('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => createDiagnosis(report.patient_id, report.report_id)}
                                disabled={diagnosisLoading || !diagnosisForm.diagnosis_name}
                                className="bg-medical-500 hover:bg-medical-600"
                              >
                                {diagnosisLoading ? 'Creating...' : 'Create Diagnosis'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Responses;
