import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexus-medi-backend.onrender.com/api/v1';

const Test = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({
    patient_id: '',
    test_type: '',
    test_name: '',
    ordered_date: '',
    ordered_by: user?.id || '',
    test_description: '',
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'Lab Technician' && user.role !== 'admin')) {
      navigate('/dashboard');
      return;
    }
    fetchPatients();
    fetchTests();
    // eslint-disable-next-line
  }, [user]);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients`);
      const data = await res.json();
      if (data.success) setPatients(data.data);
    } catch {}
  };

  const fetchTests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tests`);
      const data = await res.json();
      if (data.success) setTests(data.data);
    } catch {}
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !form.test_type || !form.test_name || !form.ordered_date) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Test created', description: 'Test added successfully' });
        setForm({ ...form, test_type: '', test_name: '', ordered_date: '', test_description: '', status: 'pending' });
        fetchTests();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to create test', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create test', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'Lab Technician' && user.role !== 'admin')) {
    return <div className="p-6 text-center">Access denied.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Patient Test</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Patient</Label>
              <Select value={form.patient_id} onValueChange={v => handleSelect('patient_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.patient_id} value={p.patient_id}>
                      {p.first_name} {p.last_name} ({p.patient_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Test Type</Label>
              <Input name="test_type" value={form.test_type} onChange={handleChange} required />
            </div>
            <div>
              <Label>Test Name</Label>
              <Input name="test_name" value={form.test_name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Ordered Date</Label>
              <Input name="ordered_date" type="date" value={form.ordered_date} onChange={handleChange} required />
            </div>
            <div>
              <Label>Description</Label>
              <Input name="test_description" value={form.test_description} onChange={handleChange} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => handleSelect('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-medical-500 hover:bg-medical-600" disabled={loading}>
              {loading ? 'Adding...' : 'Add Test'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div>No tests found.</div>
          ) : (
            <ul className="divide-y">
              {tests.map((t) => (
                <li key={t.test_id} className="py-2">
                  <div className="font-semibold">{t.test_name}</div>
                  <div className="text-sm text-muted-foreground">Type: {t.test_type} | Patient: {t.patient_id} | Status: {t.status}</div>
                  <div className="text-xs">Ordered: {t.ordered_date}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Test; 