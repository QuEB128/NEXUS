import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FolderOpen, Search, Plus, User, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexus-medi-backend.onrender.com/api/v1';

const Folders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [folderStatus, setFolderStatus] = useState('active');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchFolders();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      const data = await response.json();
      if (data.success) {
        setPatients(data.data);
      } else {
        setError('Failed to fetch patients');
      }
    } catch (err) {
      setError('Error fetching patients');
      console.error('Error fetching patients:', err);
    }
  };

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/folders`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFolders(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async () => {
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }
    if (!user || !user.id) {
      setError('Staff ID not found. Please try again.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: selectedPatient,
          created_by: user.id, // Send staff code (e.g., NMHS0001) as required by DB
          status: folderStatus
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFolders(prev => [...prev, data.data]);
        setIsCreateDialogOpen(false);
        setSelectedPatient('');
        setFolderStatus('active');
        setError('');
      } else {
        setError(data.error || 'Failed to create folder');
      }
    } catch (err) {
      setError('Error creating folder');
      console.error('Error creating folder:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFolders = folders.filter(folder => {
    const patient = patients.find(p => p.patient_id === folder.patient_id);
    if (!patient) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      folder.patient_id.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Patient Folders</h1>
          <p className="text-muted-foreground">
            Access organized patient documentation
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search folders..."
              className="w-full md:w-[240px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-medical-500 hover:bg-medical-600">
                <Plus className="mr-1 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Patient Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="patient">Select Patient</Label>
                  <Select 
                    value={selectedPatient} 
                    onValueChange={setSelectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem 
                          key={patient.patient_id} 
                          value={patient.patient_id}
                        >
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{patient.first_name} {patient.last_name}</span>
                            <span className="text-muted-foreground text-sm">
                              {patient.patient_id}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Folder Status</Label>
                  <Select 
                    value={folderStatus} 
                    onValueChange={setFolderStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createFolder}
                    disabled={isLoading || !selectedPatient}
                    className="bg-medical-500 hover:bg-medical-600"
                  >
                    {isLoading ? 'Creating...' : 'Create Folder'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && folders.length === 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
            <p className="mt-4 text-muted-foreground">Loading folders...</p>
          </div>
        </div>
      ) : folders.length === 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="rounded-full bg-medical-100 p-4">
              <FolderOpen className="h-12 w-12 text-medical-500" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">No Patient Folders Yet</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Create your first patient folder to organize and access patient records.
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-6 bg-medical-500 hover:bg-medical-600"
            >
              Create First Folder
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFolders.map((folder) => {
            const patient = patients.find(p => p.patient_id === folder.patient_id);
            return (
              <Card key={folder.folder_id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full bg-medical-100 p-2">
                        <FolderOpen className="h-5 w-5 text-medical-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}
                        </CardTitle>
                        <CardDescription>
                          {folder.patient_id}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(folder.status)}>
                      {folder.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Created: {formatDate(folder.created_at)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      Folder ID: {folder.folder_id}
                    </div>
                    {patient && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        DOB: {formatDate(patient.date_of_birth)}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4 hover:bg-medical-50"
                    onClick={() => navigate(`/folders/${folder.folder_id}`)}
                  >
                    Open Folder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredFolders.length === 0 && folders.length > 0 && searchTerm && (
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-semibold">No folders found</h3>
            <p className="text-muted-foreground">
              No folders match your search for "{searchTerm}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Folders;