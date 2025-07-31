export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Patient {
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
  assigned_provider?: string;
  created_at: string;
  updated_at: string;
}

export type PatientFormData = Omit<Patient, 
  'patient_id' | 
  'age' | 
  'created_at' | 
  'updated_at' | 
  'admission_date'
>;
