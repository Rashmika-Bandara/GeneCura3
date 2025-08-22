const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Doctor = require('../models/Doctor');
const Geneticist = require('../models/Geneticist');
const Pharmacologist = require('../models/Pharmacologist');
const Patient = require('../models/Patient');
const Gene = require('../models/Gene');
const Medicine = require('../models/Medicine');
const MetabolizerDetail = require('../models/MetabolizerDetail');
const TreatmentCase = require('../models/TreatmentCase');

// Sample data
const sampleData = {
  doctors: [
    {
      doctor_id: 'DOC001',
      name: 'Dr. John Smith',
      licence_id: 'LIC001',
      gender: 'male',
      email: 'john.smith@genecura.com',
      mobile_number: '+1234567890',
      specialization: 'Cardiology',
      qualifications: 'MD, FACC',
      experience: 15,
      hospital: 'General Hospital',
      date_of_birth: new Date('1980-01-15'),
      password_hash: 'password123'
    },
    {
      doctor_id: 'DOC002',
      name: 'Dr. Sarah Johnson',
      licence_id: 'LIC002',
      gender: 'female',
      email: 'sarah.johnson@genecura.com',
      mobile_number: '+1234567891',
      specialization: 'Oncology',
      qualifications: 'MD, PhD',
      experience: 12,
      hospital: 'Cancer Center',
      date_of_birth: new Date('1985-03-22'),
      password_hash: 'password123'
    }
  ],

  geneticists: [
    {
      geneticist_id: 'GEN001',
      name: 'Dr. Emily Chen',
      licence_id: 'LIC003',
      gender: 'female',
      email: 'emily.chen@genecura.com',
      mobile_number: '+1234567892',
      qualifications: 'PhD in Genetics',
      experience: 10,
      working_place: 'Genomics Institute',
      date_of_birth: new Date('1988-07-10'),
      password_hash: 'password123'
    }
  ],

  pharmacologists: [
    {
      pharmacologist_id: 'PHARM001',
      name: 'Dr. Michael Brown',
      licence_id: 'LIC004',
      gender: 'male',
      email: 'michael.brown@genecura.com',
      mobile_number: '+1234567893',
      qualifications: 'PharmD, PhD',
      experience: 8,
      working_place: 'Pharmaceutical Research Lab',
      date_of_birth: new Date('1990-11-05'),
      password_hash: 'password123'
    }
  ],

  genes: [
    {
      gene_id: 'CYP2D6',
      gene_name: 'Cytochrome P450 2D6',
      genetic_variant_type: 'SNP',
      metabolizer_status: 'normal'
    },
    {
      gene_id: 'CYP2C19',
      gene_name: 'Cytochrome P450 2C19',
      genetic_variant_type: 'SNP',
      metabolizer_status: 'rapid'
    },
    {
      gene_id: 'BRCA1',
      gene_name: 'Breast Cancer Gene 1',
      genetic_variant_type: 'Mutation',
      metabolizer_status: 'normal'
    }
  ],

  medicines: [
    {
      medicine_id: 'MED001',
      name: 'Warfarin',
      purpose: 'Anticoagulant',
      drug_interactions: 'Aspirin, Vitamin K',
      allergy_risks: 'Bleeding disorders'
    },
    {
      medicine_id: 'MED002',
      name: 'Codeine',
      purpose: 'Pain relief',
      drug_interactions: 'MAO inhibitors, CNS depressants',
      allergy_risks: 'Respiratory depression'
    },
    {
      medicine_id: 'MED003',
      name: 'Clopidogrel',
      purpose: 'Antiplatelet',
      drug_interactions: 'Proton pump inhibitors',
      allergy_risks: 'Bleeding'
    }
  ]
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genecura');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Doctor.deleteMany({}),
      Geneticist.deleteMany({}),
      Pharmacologist.deleteMany({}),
      Patient.deleteMany({}),
      Gene.deleteMany({}),
      Medicine.deleteMany({}),
      MetabolizerDetail.deleteMany({}),
      TreatmentCase.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Seed users
    console.log('Seeding users...');
    const doctors = await Doctor.create(sampleData.doctors);
    const geneticists = await Geneticist.create(sampleData.geneticists);
    const pharmacologists = await Pharmacologist.create(sampleData.pharmacologists);
    console.log(`Created ${doctors.length} doctors, ${geneticists.length} geneticists, ${pharmacologists.length} pharmacologists`);

    // Seed genes
    console.log('Seeding genes...');
    const genes = await Gene.create(sampleData.genes);
    console.log(`Created ${genes.length} genes`);

    // Seed medicines
    console.log('Seeding medicines...');
    const medicines = await Medicine.create(sampleData.medicines);
    console.log(`Created ${medicines.length} medicines`);

    // Seed metabolizer details
    console.log('Seeding metabolizer details...');
    const metabolizerDetails = [];
    for (const gene of genes) {
      metabolizerDetails.push({
        gene_id: gene.gene_id,
        status_label: gene.metabolizer_status,
        notes: `Default metabolizer status for ${gene.gene_name}`
      });
    }
    const createdMetabolizers = await MetabolizerDetail.create(metabolizerDetails);
    console.log(`Created ${createdMetabolizers.length} metabolizer details`);

    // Seed sample patients
    console.log('Seeding sample patients...');
    const samplePatients = [
      {
        patient_id: 'PAT001',
        patient_name: 'Alice Wilson',
        gene_id: genes[0].gene_id,
        gene_name: genes[0].gene_name,
        weight: 65,
        address: {
          street: '123 Main St',
          city: 'Springfield',
          province: 'Illinois'
        },
        gender: 'female',
        health_condition: 'Hypertension',
        mobile_number: '+1555123456',
        medicine_id: medicines[0].medicine_id,
        medicine_name: medicines[0].name,
        created_by_doctor_id: doctors[0].doctor_id
      },
      {
        patient_id: 'PAT002',
        patient_name: 'Bob Davis',
        gene_id: genes[1].gene_id,
        gene_name: genes[1].gene_name,
        weight: 78,
        address: {
          street: '456 Oak Ave',
          city: 'Madison',
          province: 'Wisconsin'
        },
        gender: 'male',
        health_condition: 'Diabetes',
        mobile_number: '+1555123457',
        medicine_id: medicines[1].medicine_id,
        medicine_name: medicines[1].name,
        created_by_doctor_id: doctors[1].doctor_id
      }
    ];
    const patients = await Patient.create(samplePatients);
    console.log(`Created ${patients.length} patients`);

    // Seed sample treatment cases
    console.log('Seeding treatment cases...');
    const sampleTreatmentCases = [
      {
        gene_id: genes[0].gene_id,
        medicine_id: medicines[0].medicine_id,
        doctor_id: doctors[0].doctor_id,
        pharmacologist_id: pharmacologists[0].pharmacologist_id,
        geneticist_id: geneticists[0].geneticist_id,
        effectiveness: 85,
        treatment_time: 30,
        patient_gender: 'female',
        patient_age: 45
      },
      {
        gene_id: genes[1].gene_id,
        medicine_id: medicines[1].medicine_id,
        doctor_id: doctors[1].doctor_id,
        pharmacologist_id: pharmacologists[0].pharmacologist_id,
        geneticist_id: geneticists[0].geneticist_id,
        effectiveness: 72,
        treatment_time: 21,
        patient_gender: 'male',
        patient_age: 38
      },
      {
        gene_id: genes[2].gene_id,
        medicine_id: medicines[2].medicine_id,
        doctor_id: doctors[0].doctor_id,
        pharmacologist_id: pharmacologists[0].pharmacologist_id,
        geneticist_id: geneticists[0].geneticist_id,
        effectiveness: 93,
        treatment_time: 45,
        patient_gender: 'female',
        patient_age: 52
      }
    ];
    const treatmentCases = await TreatmentCase.create(sampleTreatmentCases);
    console.log(`Created ${treatmentCases.length} treatment cases`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('👨‍⚕️ Doctor:');
    console.log('  - User ID: DOC001, Password: password123');
    console.log('  - User ID: DOC002, Password: password123');
    console.log('🧬 Geneticist:');
    console.log('  - User ID: GEN001, Password: password123');
    console.log('💊 Pharmacologist:');
    console.log('  - User ID: PHARM001, Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();
