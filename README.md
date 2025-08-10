# Nexus: Revolutionizing Rural and Urban Healthcare with AI


## Overview

Nexus is a smart AI-powered healthcare assistanive decvice designed to transform medical service delivery, in both urban and rural areas. It combines speech recognition, medical consultation session documentation, AI recommendations and report generation, vital sign monitoring, and risk flagging and cloud-based health record management into one compact portable device.

## Problem Statement

In many hospitals across Ghana, the absence of modern health care technologies has made patient documentation and risk flagging during consultations a persistent challenge. Doctors are often forced to rely on outdated methods manually writing or typing notes during patient interactions. This process is not only time-consuming and mentally taxing, but it also compromises the accuracy and completeness of medical records. Critical patient details are often missed, as health care providers cannot possibly document every symptom, phrase, or concern expressed during a session. These systemic inefficiencies contribute to delayed diagnoses, fragmented continuity of care, and poor patient history tracking ultimately impacting the quality and speed of medical treatment.

## Solution

The Nexus device offers a transformative solution to the documentation and diagnostic challenges in Ghana’s health care system by leveraging intelligent automation. Powered by the Gemini 2.5 API, the system integrates advanced sensors and secure cloud storage to deliver seamless, AI-driven consultation documentation. During patient interactions, Nexus automatically monitors vital signs and listens attentively to the entire session. It then generates a comprehensive, AI-written medical report that includes a full transcription of the conversation, suggested diagnoses, recommended tests, and detailed treatment plans all tailored to the patient’s symptoms, history, and real-time health data. This report is instantly attached to the patient's digital record, ensuring accuracy, consistency, and accessibility. Nexus not only reduces the cognitive burden on medical staff but also enhances decision-making, speeds up diagnosis, and strengthens continuity of care.

## Key Features

-RFID Integration: Reads patient ID and pulls medical history from the cloud.

-Vital Signs Monitoring: Tracks heart rate, temperature and SpO2 using sensors.

-AI Medical Consultations: Uses Gemini 2.5 to analyze complaints and generate provisional diagnoses.

-Health Record Reporting: Automatically generates and saves reports in Word format.

-Cloud-Based Storage: Uploads updated patient data in real-time for doctor access.

-Doctor Dashboard: Enables remote patient history access and case tracking.

SDGs Addressed

## Nexus addresses the following UN Sustainable Development Goals:

-SDG 3: Good Health and Well-Being

-SDG 9: Industry, Innovation, and Infrastructure

-SDG 10: Reduced Inequalities

-SDG 11: Sustainable Cities and Communities

## Technologies Used

**Software:**
This project is built with:

-Python

-Gemini 2.5 API

-Vite

-TypeScript

-React

-shadcn-ui

-Tailwind CSS

**Hardware:**

-Raspberry pi 4

-Arduino uno board

-MAX30102 (Pulse sensor module)

-DS18B20 (Temperature Sensor)

-SSD1306 OLED Display (I2C version)

-RFID Scanner



## Hardware and code Installation (Document session and AI report generation)

**NB: The Main_document_session.py code can only be run on the nexus hardware for full feature experience since it makes use of GPIO pins, RFID card scanner and sensors to function perfectly. Nevertheless, a sample desktop version has been made available but you would not be able to experience the full capability of the Nexus device since your PC does not have GPIO pins for the sensors and RFID card scanner to be connected.**

-To run the code  on the Nexus device, navigate to Nexus/nexus-device/hardware_instructions.txt

-To run a sample of the AI documentation and report generation on your PC, Navigate to Nexus/nexus-device/how_to_run_code.txt for detailed steps.

## Software code Installation(Nexus Medic Hub)


A comprehensive medical facility management and metrics platform.

## Development

**Use your preferred IDE**

Clone and set up the project locally to start development.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/Cascasemi/nexus-medic-hub

# Step 2: Navigate to the project directory.
cd nexus-medic-hub

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.


## Deployment

The application can be deployed using any platform that supports React applications, such as:
-Vercel

-Netlify

-AWS Amplify

-Digital Ocean App Platform

For production deployment, build the application using:
```sh
npm run build
```

## Watch Our Demo
demovideo.com

## How to Get Involved
We invite doctors, hospitals, healthcare institutions, NGOs, researchers, and technology partners to collaborate with us in bringing Robot Nexus to both rural and urban healthcare settings. By joining our pilot programs, you can help validate, refine, and expand the system to meet the unique needs of your facility and community.

**Partnership opportunities include:**

-Pilot Deployment: Test Robot Nexus in real-world clinical environments and provide valuable feedback for optimization.

-Co-Development: Collaborate with our team on new features such as advanced diagnostics, multilingual voice support, telemedicine integration, and AI-driven predictive health analytics.

-Research Collaboration: Partner with us to study the impact of AI-driven healthcare assistants on efficiency, patient outcomes, and healthcare equity.

-Technology Integration: Work with us to connect Robot Nexus to existing hospital management systems, EHR platforms, or regional health networks.

**We envision future developments such as:**

-Expanded Vital Sign Coverage (e.g., blood pressure, ECG, blood glucose monitoring).

-Real-Time Teleconsultations with remote specialists.

-AI-Powered Preventive Care Alerts for chronic disease management.

-Mobile App Integration for patients and caregivers.

If you share our vision of transforming healthcare delivery through intelligent automation, we would be excited to partner with you.

Email us at robotnexus111@gmail.com
