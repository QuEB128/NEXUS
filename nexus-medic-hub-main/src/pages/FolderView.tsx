import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, ArrowLeft, Folder as FolderIcon, ChevronDown, ChevronRight, ClipboardList, MoreVertical, Eye } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexus-medi-backend.onrender.com/api/v1';

const FolderView = () => {
  const { folder_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [folder, setFolder] = useState(null);
  const [patient, setPatient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [tests, setTests] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [showTests, setShowTests] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showDiagnoses, setShowDiagnoses] = useState(false);
  const [showTreatmentPlans, setShowTreatmentPlans] = useState(false);
  const [openActivitiesPlanId, setOpenActivitiesPlanId] = useState(null);
  const [activities, setActivities] = useState({}); // { [plan_id]: [activity, ...] }
  const [loadingActivities, setLoadingActivities] = useState({}); // { [plan_id]: boolean }
  const [openTestResultsId, setOpenTestResultsId] = useState(null);
  const [testResults, setTestResults] = useState({}); // { [test_id]: [result, ...] }
  const [loadingTestResults, setLoadingTestResults] = useState({}); // { [test_id]: boolean }
  const [openDiagnosisDescriptionId, setOpenDiagnosisDescriptionId] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    if (folder_id) {
      fetchFolder();
    }
    // eslint-disable-next-line
  }, [folder_id]);

  const fetchFolder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/folders/${folder_id}`);
      const data = await res.json();
      if (data.success) {
        setFolder(data.folder);
        setPatient(data.patient);
        setNotes(data.notes || []);
        setAttachments(data.attachments || []);
        setTests(data.tests || []);
        // Fetch diagnoses separately to ensure we get the right data
        if (data.patient && data.patient.patient_id) {
          await fetchDiagnoses(data.patient.patient_id);
        }
      } else {
        setError(data.error || 'Failed to load folder');
      }
    } catch (err) {
      setError('Error fetching folder');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnoses = async (patientId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${patientId}/diagnoses`);
      const data = await res.json();
      if (data.success) {
        setDiagnoses(data.data || []);
      } else {
        console.error('Failed to fetch diagnoses:', data.error);
        setDiagnoses([]);
      }
    } catch (err) {
      console.error('Error fetching diagnoses:', err);
      setDiagnoses([]);
    }
  };

  const fetchActivities = async (plan_id) => {
    if (activities[plan_id]) return; // Already fetched
    setLoadingActivities((prev) => ({ ...prev, [plan_id]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/treatment-plans/${plan_id}/activities`);
      const data = await res.json();
      if (data.success) {
        setActivities((prev) => ({ ...prev, [plan_id]: data.data || [] }));
      }
    } catch (err) {
      setActivities((prev) => ({ ...prev, [plan_id]: [] }));
    } finally {
      setLoadingActivities((prev) => ({ ...prev, [plan_id]: false }));
    }
  };

  const fetchTestResults = async (test_id) => {
    if (testResults[test_id]) return; // Already fetched
    setLoadingTestResults((prev) => ({ ...prev, [test_id]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${test_id}/results`);
      const data = await res.json();
      if (data.success) {
        setTestResults((prev) => ({ ...prev, [test_id]: data.data || [] }));
      }
    } catch (err) {
      setTestResults((prev) => ({ ...prev, [test_id]: [] }));
    } finally {
      setLoadingTestResults((prev) => ({ ...prev, [test_id]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper to display user-friendly nulls
  const displayValue = (val, fallback = 'Not specified') => {
    if (val === null || val === undefined || val === '') return fallback;
    return val;
  };

  const renderEmergencyContact = (contact) => {
    if (!contact) return 'Not specified';
    return (
      <div className="space-y-1">
        <div><b>Name:</b> {displayValue(contact.name)}</div>
        <div><b>Phone:</b> {displayValue(contact.phone)}</div>
        <div><b>Relationship:</b> {displayValue(contact.relationship)}</div>
      </div>
    );
  };

  const renderAddress = (address) => {
    if (!address) return 'Not specified';
    return (
      <div className="space-y-1">
        <div><b>Street:</b> {displayValue(address.street)}</div>
        <div><b>City:</b> {displayValue(address.city)}</div>
        <div><b>State:</b> {displayValue(address.state)}</div>
        <div><b>Country:</b> {displayValue(address.country)}</div>
        <div><b>Postal Code:</b> {displayValue(address.postalCode)}</div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading folder...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  if (!folder) {
    return <div className="p-6 text-center">Folder not found.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Folder Details</CardTitle>
          <CardDescription>Folder ID: {folder.folder_id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Badge>{folder.status}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Created: {formatDate(folder.created_at)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Updated: {formatDate(folder.updated_at)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              Created By: {folder.created_by}
            </div>
          </div>
        </CardContent>
      </Card>
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Patient ID: {patient.patient_id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Name: {displayValue(patient.first_name)} {displayValue(patient.last_name)}</div>
              <div>Date of Birth: {displayValue(patient.date_of_birth, 'No date of birth')}</div>
              <div>Status: {displayValue(patient.current_status)}</div>
              <div>Diagnosis: {displayValue(patient.current_diagnosis)}</div>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowPatientModal(true)}>
                Read More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Patient Info Modal */}
      {showPatientModal && patient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPatientModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4">Patient Details</h3>
            <div className="space-y-2">
              <div><b>Patient ID:</b> {displayValue(patient.patient_id)}</div>
              <div><b>First Name:</b> {displayValue(patient.first_name)}</div>
              <div><b>Last Name:</b> {displayValue(patient.last_name)}</div>
              <div><b>Date of Birth:</b> {displayValue(patient.date_of_birth, 'No date of birth')}</div>
              <div><b>Admission Date:</b> {displayValue(patient.admission_date, 'No admission date')}</div>
              <div><b>Blood Group:</b> {displayValue(patient.blood_group)}</div>
              <div><b>Phone:</b> {displayValue(patient.phone)}</div>
              <div><b>Email:</b> {displayValue(patient.email)}</div>
              <div><b>Status:</b> {displayValue(patient.current_status)}</div>
              <div><b>Diagnosis:</b> {displayValue(patient.current_diagnosis)}</div>
              <div><b>Medical History:</b> {displayValue(patient.medical_history)}</div>
              <div><b>Assigned Provider:</b> {displayValue(patient.assigned_provider)}</div>
              <div><b>Created At:</b> {displayValue(patient.created_at)}</div>
              <div><b>Updated At:</b> {displayValue(patient.updated_at)}</div>
              <div><b>Emergency Contact:</b> {renderEmergencyContact(patient.emergency_contact)}</div>
              <div><b>Address:</b> {renderAddress(patient.address)}</div>
            </div>
          </div>
        </div>
      )}
      {/* You can add more sections for notes, attachments, tests, diagnoses, etc. */}
      {/* Example: */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div>No notes available.</div>
          ) : (
            <ul className="list-disc pl-5">
              {notes.map((note) => (
                <li key={note.id}>{note.content}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      {/* Test Section */}
      <Card>
        <CardHeader
          className="flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-50"
          onClick={() => setShowTests((prev) => !prev)}
        >
          <FileText className="h-5 w-5 text-medical-500" />
          <CardTitle className="text-lg">Test</CardTitle>
          <span className="ml-auto flex items-center">
            {showTests ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </CardHeader>
        {showTests && (
          <CardContent>
            {tests.length === 0 ? (
              <div>No test information available.</div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => (
                  <Card key={test.test_id} className="border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{test.test_name || 'Untitled Test'}</div>
                      <button
                        className="ml-2 px-2 py-1 rounded text-xs bg-green-500 hover:bg-green-600 text-white"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (openTestResultsId === test.test_id) {
                            setOpenTestResultsId(null);
                          } else {
                            setOpenTestResultsId(test.test_id);
                            await fetchTestResults(test.test_id);
                          }
                        }}
                        aria-label="Show test results"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Results
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground">Type: {test.test_type || 'N/A'}</div>
                    <div className="text-sm">Ordered Date: {test.ordered_date ? formatDate(test.ordered_date) : 'N/A'}</div>
                    <div className="text-sm">Ordered By: {test.ordered_by || 'N/A'}</div>
                    <div className="text-sm">Status: {test.test_status || 'N/A'}</div>
                    {test.test_description && (
                      <div className="text-sm mt-2">Description: {test.test_description}</div>
                    )}
                    {test.completed_date && (
                      <div className="text-sm">Completed: {formatDate(test.completed_date)}</div>
                    )}
                    {/* Test Results Popup */}
                    {openTestResultsId === test.test_id && (
                      <div className="absolute z-10 left-0 right-0 mt-2 bg-white border rounded shadow-lg p-4">
                        {loadingTestResults[test.test_id] ? (
                          <div>Loading test results...</div>
                        ) : testResults[test.test_id] && testResults[test.test_id].length > 0 ? (
                          <div className="space-y-3">
                            {testResults[test.test_id].map((result) => (
                              <Card key={result.result_id} className="border p-2">
                                <div className="font-semibold">Result Value: {result.result_value || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">Unit: {result.result_unit || 'N/A'}</div>
                                <div className="text-sm">Reference Range: {result.reference_range || 'N/A'}</div>
                                <div className="text-sm">Result Status: {result.result_status || 'N/A'}</div>
                                <div className="text-sm">Result Date: {result.result_date ? formatDate(result.result_date) : 'N/A'}</div>
                                <div className="text-sm">Uploaded By: {result.uploaded_by || 'N/A'}</div>
                                <div className="text-sm">Created: {result.created_at ? formatDate(result.created_at) : 'N/A'}</div>
                                {result.result_notes && (
                                  <div className="text-sm mt-1">Notes: {result.result_notes}</div>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div>No test results available.</div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
      {/* Attachments Section */}
      <Card>
        <CardHeader
          className="flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-50"
          onClick={() => setShowAttachments((prev) => !prev)}
        >
          <FileText className="h-5 w-5 text-medical-500" />
          <CardTitle className="text-lg">Attachments</CardTitle>
          <span className="ml-auto flex items-center">
            {showAttachments ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </CardHeader>
        {showAttachments && (
          <CardContent>
            {attachments.length === 0 ? (
              <div>No attachments available.</div>
            ) : (
              <div className="space-y-4">
                {attachments.map((att) => (
                  <Card key={att.attachment_id} className="border p-3">
                    <div className="font-semibold">{att.file_name || 'Untitled File'}</div>
                    <div className="text-sm text-muted-foreground">Type: {att.file_type || 'N/A'}</div>
                    <div className="text-sm">Uploaded By: {att.uploaded_by || 'N/A'}</div>
                    <div className="text-sm">Created: {att.created_at ? formatDate(att.created_at) : 'N/A'}</div>
                    {att.file_size && (
                      <div className="text-sm">Size: {att.file_size} bytes</div>
                    )}
                    {att.description && (
                      <div className="text-sm mt-2">Description: {att.description}</div>
                    )}
                    {att.file_path && (
                      <div className="text-sm mt-2">Path: {att.file_path}</div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
      {/* Diagnoses Section */}
      <Card>
        <CardHeader
          className="flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-50"
          onClick={() => setShowDiagnoses((prev) => !prev)}
        >
          <FileText className="h-5 w-5 text-medical-500" />
          <CardTitle className="text-lg">Diagnoses</CardTitle>
          <span className="ml-auto flex items-center">
            {showDiagnoses ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </CardHeader>
        {showDiagnoses && (
          <CardContent>
            {diagnoses.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No diagnoses available.</div>
            ) : (
              <div className="space-y-4">
                {diagnoses.map((diag) => (
                  <Card key={diag.diagnosis_id} className="border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-2">{diag.diagnosis_name || 'Untitled Diagnosis'}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Severity: {diag.severity || 'N/A'}</span>
                          <span>Created: {diag.created_at ? formatDate(diag.created_at) : 'N/A'}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenDiagnosisDescriptionId(
                          openDiagnosisDescriptionId === diag.diagnosis_id ? null : diag.diagnosis_id
                        )}
                        className="ml-2"
                      >
                        {openDiagnosisDescriptionId === diag.diagnosis_id ? 'Hide' : 'View'} Description
                      </Button>
                    </div>
                    {openDiagnosisDescriptionId === diag.diagnosis_id && diag.diagnosis_description && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-medical-500">
                        <div className="text-sm font-medium mb-1">Description:</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {diag.diagnosis_description}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
      {/* Treatment Plan Section */}
      <Card>
        <CardHeader
          className="flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-50"
          onClick={() => setShowTreatmentPlans((prev) => !prev)}
        >
          <ClipboardList className="h-5 w-5 text-medical-500" />
          <CardTitle className="text-lg">Treatment Plans</CardTitle>
          <span className="ml-auto flex items-center">
            {showTreatmentPlans ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </CardHeader>
        {showTreatmentPlans && (
          <CardContent>
            {Array.isArray(folder?.treatment_plans) && folder.treatment_plans.length === 0 ? (
              <div>No treatment plans available.</div>
            ) : (
              <div className="space-y-4">
                {(folder?.treatment_plans || []).map((plan) => (
                  <div key={plan.plan_id} className="relative">
                    <Card className="border p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{plan.plan_name || 'Untitled Plan'}</div>
                        <button
                          className="ml-2 p-1 rounded hover:bg-gray-100"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (openActivitiesPlanId === plan.plan_id) {
                              setOpenActivitiesPlanId(null);
                            } else {
                              setOpenActivitiesPlanId(plan.plan_id);
                              await fetchActivities(plan.plan_id);
                            }
                          }}
                          aria-label="Show activities"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground">Status: {plan.status || 'active'}</div>
                      <div className="text-sm">Priority: {plan.priority || 'medium'}</div>
                      <div className="text-sm">Start Date: {plan.start_date ? formatDate(plan.start_date) : 'N/A'}</div>
                      <div className="text-sm">End Date: {plan.end_date ? formatDate(plan.end_date) : 'N/A'}</div>
                      <div className="text-sm">Created By: {plan.created_by || 'N/A'}</div>
                      <div className="text-sm">Created: {plan.created_at ? formatDate(plan.created_at) : 'N/A'}</div>
                      {plan.plan_description && (
                        <div className="text-sm mt-2">Description: {plan.plan_description}</div>
                      )}
                    </Card>
                    {/* Activities Popover/Dropdown */}
                    {openActivitiesPlanId === plan.plan_id && (
                      <div className="absolute z-10 left-0 right-0 mt-2 bg-white border rounded shadow-lg p-4">
                        {loadingActivities[plan.plan_id] ? (
                          <div>Loading activities...</div>
                        ) : activities[plan.plan_id] && activities[plan.plan_id].length > 0 ? (
                          <div className="space-y-3">
                            {activities[plan.plan_id].map((act) => (
                              <Card key={act.activity_id} className="border p-2">
                                <div className="font-semibold">{act.activity_name || 'Untitled Activity'}</div>
                                <div className="text-sm text-muted-foreground">Type: {act.activity_type || 'N/A'}</div>
                                <div className="text-sm">Start Date: {act.start_date ? formatDate(act.start_date) : 'N/A'}</div>
                                <div className="text-sm">End Date: {act.end_date ? formatDate(act.end_date) : 'N/A'}</div>
                                <div className="text-sm">Created By: {act.created_by || 'N/A'}</div>
                                <div className="text-sm">Created: {act.created_at ? formatDate(act.created_at) : 'N/A'}</div>
                                <div className="text-sm">Status: {act.status || 'active'}</div>
                                {act.dosage && <div className="text-sm">Dosage: {act.dosage}</div>}
                                {act.frequency && <div className="text-sm">Frequency: {act.frequency}</div>}
                                {act.instructions && <div className="text-sm mt-1">Instructions: {act.instructions}</div>}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div>No activities for this plan.</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
      {/* Add similar cards for tests and diagnoses if needed */}
    </div>
  );
};

export default FolderView; 