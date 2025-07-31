import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserRound,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Activity,
  FileText,
  AlertCircle,
  Stethoscope,
  X,
  Edit2,
  Trash
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import api from "@/utils/axiosConfig";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  blood_group?: string;
  emergency_contact?: EmergencyContact;
  phone?: string;
  email?: string;
  address?: Address;
  admission_date: string;
  current_status?: 'stable' | 'critical' | 'improving' | 'observation';
  current_diagnosis?: string;
  medical_history?: string;
  assigned_provider?: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  blood_group?: string;
  phone?: string;
  email?: string;
  emergency_contact?: EmergencyContact;
  address?: Address;
  current_status?: 'stable' | 'critical' | 'improving' | 'observation';
  current_diagnosis?: string;
  medical_history?: string;
  assigned_provider?: string | null;
}

const Patients = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    blood_group: "",
    phone: "",
    email: "",
    emergency_contact: {
      name: "",
      relationship: "",
      phone: ""
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    },
    current_status: "stable",
    current_diagnosis: "",
    medical_history: "",
    assigned_provider: null
  });

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/patients");
      const patientsWithAge = response.data.data.map((patient: Patient) => ({
        ...patient,
        age: calculateAge(patient.date_of_birth)
      }));
      setPatients(patientsWithAge || []);
    } catch (error: any) {
      setError(error.response?.data?.error || error.message);
      toast({
        variant: "destructive",
        title: "Error loading patients",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || patient.current_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePatient = async () => {
    try {
      if (!formData.first_name || !formData.last_name || !formData.date_of_birth) {
        const missingFields = [];
        if (!formData.first_name) missingFields.push('First Name');
        if (!formData.last_name) missingFields.push('Last Name');
        if (!formData.date_of_birth) missingFields.push('Date of Birth');
        
        toast({
          variant: "destructive",
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(', ')}`
        });
        return;
      }

      const birthDate = new Date(formData.date_of_birth);
      if (isNaN(birthDate.getTime())) {
        toast({
          variant: "destructive",
          title: "Invalid Date",
          description: "Please enter a valid date of birth"
        });
        return;
      }

      const patientData = {
        ...formData,
        admission_date: new Date().toISOString(),
        assigned_provider: formData.assigned_provider || null
      };

      const response = await api.post("/patients", patientData);
      
      toast({ 
        title: "Success", 
        description: "Patient created successfully",
        variant: "default"
      });
      setIsAddDialogOpen(false);
      fetchPatients();
      
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        blood_group: "",
        phone: "",
        email: "",
        emergency_contact: {
          name: "",
          relationship: "",
          phone: ""
        },
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: ""
        },
        current_status: "stable",
        current_diagnosis: "",
        medical_history: "",
        assigned_provider: null
      });
    } catch (error: any) {
      console.error('Error creating patient:', error);
      const errorMessage = error.response?.data?.error || error.message;
      
      toast({
        variant: "destructive",
        title: "Error creating patient",
        description: errorMessage
      });
    }
  };

  const handleUpdatePatient = async () => {
    try {
      if (!selectedPatient) return;
      if (!formData.first_name || !formData.last_name || !formData.date_of_birth) {
        const missingFields = [];
        if (!formData.first_name) missingFields.push('First Name');
        if (!formData.last_name) missingFields.push('Last Name');
        if (!formData.date_of_birth) missingFields.push('Date of Birth');
        
        toast({
          variant: "destructive",
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(', ')}`
        });
        return;
      }

      const birthDate = new Date(formData.date_of_birth);
      if (isNaN(birthDate.getTime())) {
        toast({
          variant: "destructive",
          title: "Invalid Date",
          description: "Please enter a valid date of birth"
        });
        return;
      }

      const response = await api.put(`/patients/${selectedPatient.patient_id}`, formData);
      
      toast({ 
        title: "Success", 
        description: "Patient updated successfully",
        variant: "default"
      });
      setIsEditDialogOpen(false);
      fetchPatients();
      
      // Reset form and selection
      setSelectedPatient(null);
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        blood_group: "",
        phone: "",
        email: "",
        emergency_contact: {
          name: "",
          relationship: "",
          phone: ""
        },
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: ""
        },
        current_status: "stable",
        current_diagnosis: "",
        medical_history: "",
        assigned_provider: null
      });
    } catch (error: any) {
      console.error('Error updating patient:', error);
      const errorMessage = error.response?.data?.error || error.message;
      
      toast({
        variant: "destructive",
        title: "Error updating patient",
        description: errorMessage
      });
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await api.delete(`/patients/${patientId}`);
      toast({
        title: "Success",
        description: "Patient deleted successfully",
        variant: "default"
      });
      fetchPatients();
      setIsDetailsOpen(false); // Close the details sheet if open
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      toast({
        variant: "destructive",
        title: "Error deleting patient",
        description: error.response?.data?.error || error.message
      });
    }
  };

  const statusColors = {
    stable: "bg-green-100 text-green-800",
    critical: "bg-red-100 text-red-800",
    improving: "bg-blue-100 text-blue-800",
    observation: "bg-yellow-100 text-yellow-800"
  };

  if (loading) return <div className="p-6 text-center">Loading patients...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">
            Total patients: {patients.length} | Showing: {filteredPatients.length}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="improving">Improving</SelectItem>
              <SelectItem value="observation">Observation</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.patient_id}>
                  <TableCell className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[patient.current_status || 'stable']}>
                      {patient.current_status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{patient.assigned_provider || 'Unassigned'}</TableCell>
                  <TableCell>
                    {format(new Date(patient.admission_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>                        <DropdownMenuItem onClick={() => {
                          setSelectedPatient(patient);
                          setIsDetailsOpen(true);
                        }}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedPatient(patient);
                          setFormData({
                            first_name: patient.first_name,
                            last_name: patient.last_name,
                            date_of_birth: patient.date_of_birth.split('T')[0],
                            blood_group: patient.blood_group || "",
                            phone: patient.phone || "",
                            email: patient.email || "",
                            emergency_contact: patient.emergency_contact || {
                              name: "",
                              relationship: "",
                              phone: ""
                            },
                            address: patient.address || {
                              street: "",
                              city: "",
                              state: "",
                              country: "",
                              postalCode: ""
                            },
                            current_status: patient.current_status || "stable",
                            current_diagnosis: patient.current_diagnosis || "",
                            medical_history: patient.medical_history || "",
                            assigned_provider: patient.assigned_provider || null
                          });
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Patient
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPatientToDelete(patient.patient_id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Patient Record</DialogTitle>
            <DialogDescription>
              Complete all required fields. Admission date will be automatically set to today.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-4">
            <div className="grid gap-4 py-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    type="date"
                    id="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const formattedDate = date.toISOString().split('T')[0];
                      setFormData({...formData, date_of_birth: formattedDate});
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) => setFormData({...formData, blood_group: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" /> Assigned Provider
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.assigned_provider || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      assigned_provider: e.target.value || null
                    })}
                    placeholder="Enter provider ID (optional)"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData({...formData, assigned_provider: null})}
                    disabled={!formData.assigned_provider}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={formData.emergency_contact?.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergency_contact: {
                        ...formData.emergency_contact!,
                        name: e.target.value
                      }
                    })}
                  />
                  <Input
                    placeholder="Relationship"
                    value={formData.emergency_contact?.relationship}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergency_contact: {
                        ...formData.emergency_contact!,
                        relationship: e.target.value
                      }
                    })}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={formData.emergency_contact?.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergency_contact: {
                        ...formData.emergency_contact!,
                        phone: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid gap-4">
                  <Input
                    placeholder="Street Address"
                    value={formData.address?.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: {
                        ...formData.address!,
                        street: e.target.value
                      }
                    })}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="City"
                      value={formData.address?.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          city: e.target.value
                        }
                      })}
                    />
                    <Input
                      placeholder="State/Province"
                      value={formData.address?.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          state: e.target.value
                        }
                      })}
                    />
                    <Input
                      placeholder="Postal Code"
                      value={formData.address?.postalCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          postalCode: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Country"
                      value={formData.address?.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          country: e.target.value
                        }
                      })}
                    />
                    <Select
                      value={formData.current_status}
                      onValueChange={(value: 'stable' | 'critical' | 'improving' | 'observation') => 
                        setFormData({...formData, current_status: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="improving">Improving</SelectItem>
                        <SelectItem value="observation">Observation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Diagnosis</Label>
                <Textarea
                  value={formData.current_diagnosis}
                  onChange={(e) => setFormData({...formData, current_diagnosis: e.target.value})}
                  placeholder="Enter primary diagnosis..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Medical History</Label>
                <Textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                  placeholder="Enter relevant medical history..."
                  rows={4}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={handleCreatePatient}
              disabled={!formData.first_name || !formData.last_name || !formData.date_of_birth}
            >
              Create Patient Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Patient Record</DialogTitle>
            <DialogDescription>
              Update patient information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-4">
            <div className="grid gap-4 py-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_date_of_birth">Date of Birth *</Label>
                  <Input
                    type="date"
                    id="edit_date_of_birth"
                    value={formData.date_of_birth}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const formattedDate = date.toISOString().split('T')[0];
                      setFormData({...formData, date_of_birth: formattedDate});
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_blood_group">Blood Group</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) => setFormData({...formData, blood_group: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    type="tel"
                    id="edit_phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    type="email"
                    id="edit_email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={formData.emergency_contact?.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergency_contact: {
                        ...formData.emergency_contact!,
                        name: e.target.value
                      }
                    })}
                  />
                  <Input
                    placeholder="Relationship"
                    value={formData.emergency_contact?.relationship}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergency_contact: {
                        ...formData.emergency_contact!,
                        relationship: e.target.value
                      }
                    })}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={formData.emergency_contact?.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergency_contact: {
                        ...formData.emergency_contact!,
                        phone: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid gap-4">
                  <Input
                    placeholder="Street Address"
                    value={formData.address?.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: {
                        ...formData.address!,
                        street: e.target.value
                      }
                    })}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="City"
                      value={formData.address?.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          city: e.target.value
                        }
                      })}
                    />
                    <Input
                      placeholder="State/Province"
                      value={formData.address?.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          state: e.target.value
                        }
                      })}
                    />
                    <Input
                      placeholder="Postal Code"
                      value={formData.address?.postalCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          postalCode: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Country"
                      value={formData.address?.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          country: e.target.value
                        }
                      })}
                    />
                    <Select
                      value={formData.current_status}
                      onValueChange={(value: 'stable' | 'critical' | 'improving' | 'observation') => 
                        setFormData({...formData, current_status: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="improving">Improving</SelectItem>
                        <SelectItem value="observation">Observation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Diagnosis</Label>
                <Textarea
                  value={formData.current_diagnosis}
                  onChange={(e) => setFormData({...formData, current_diagnosis: e.target.value})}
                  placeholder="Enter primary diagnosis..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Medical History</Label>
                <Textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                  placeholder="Enter relevant medical history..."
                  rows={4}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedPatient(null);
            }}>
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={handleUpdatePatient}
              disabled={!formData.first_name || !formData.last_name || !formData.date_of_birth}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-2xl h-full flex flex-col">
          {selectedPatient && (
            <>
              <SheetHeader>
                <SheetTitle>Patient Details</SheetTitle>
                <SheetDescription>
                  ID: {selectedPatient.patient_id} | Created: {format(new Date(selectedPatient.created_at), 'MMM dd, yyyy')}
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1 px-4">
                <div className="py-4 space-y-6 pr-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedPatient.age} years | {selectedPatient.blood_group || 'Blood type not specified'}
                      </p>
                    </div>
                    <Badge className={statusColors[selectedPatient.current_status || 'stable']}>
                      {selectedPatient.current_status || 'Unknown status'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Date of Birth
                      </Label>
                      <p>{format(new Date(selectedPatient.date_of_birth), 'MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Admission Date
                      </Label>
                      <p>{format(new Date(selectedPatient.admission_date), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  {(selectedPatient.phone || selectedPatient.email) && (
                    <div>
                      <Label>Contact Information</Label>
                      <div className="flex items-center gap-4 mt-2">
                        {selectedPatient.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{selectedPatient.phone}</span>
                          </div>
                        )}
                        {selectedPatient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{selectedPatient.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedPatient.assigned_provider ? (
                    <div>
                      <Label className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" /> Assigned Provider
                      </Label>
                      <p>{selectedPatient.assigned_provider}</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      No provider assigned
                    </div>
                  )}

                  {selectedPatient.emergency_contact && (
                    <div>
                      <Label>Emergency Contact</Label>
                      <div className="mt-2 space-y-1">
                        <p>{selectedPatient.emergency_contact.name}</p>
                        <p className="text-muted-foreground">
                          {selectedPatient.emergency_contact.relationship} | {selectedPatient.emergency_contact.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedPatient.address && (
                    <div>
                      <Label>Address</Label>
                      <div className="mt-2 space-y-1">
                        <p>{selectedPatient.address.street}</p>
                        <p>
                          {selectedPatient.address.city}, {selectedPatient.address.state} {selectedPatient.address.postalCode}
                        </p>
                        <p>{selectedPatient.address.country}</p>
                      </div>
                    </div>
                  )}

                  {selectedPatient.current_diagnosis && (
                    <div>
                      <Label>Current Diagnosis</Label>
                      <p className="mt-2">{selectedPatient.current_diagnosis}</p>
                    </div>
                  )}

                  {selectedPatient.medical_history && (
                    <div>
                      <Label>Medical History</Label>
                      <p className="mt-2 whitespace-pre-line">{selectedPatient.medical_history}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this patient record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (patientToDelete) {
                  handleDeletePatient(patientToDelete);
                  setDeleteConfirmOpen(false);
                  setPatientToDelete(null);
                }
              }}
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setPatientToDelete(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;