# GeneCura — Project Description & Technical Blueprint
**Version:** 1.0  
**Date:** 2025-08-19  
**Stack:** MERN (MongoDB, Express.js, React, Node.js)

---

## 1. Executive Summary
GeneCura is a secure, role‑based system that centralizes patient, gene, and medicine data to understand **how genetic differences affect drug response**. Three primary roles—Doctor, Clinical Geneticist, Clinical Pharmacologist—work with their own entities. Heads can review and approve reports. The app offers a **Treatment Analysis** grid and **Drug Variation Analysis** for medicines.

## 2. Architecture Overview
- **Frontend**: React (Vite), React Router, React Query; Tailwind CSS; React Hook Form + Zod for forms.
- **Backend**: Node.js + Express; Mongoose ODM; Multer for uploads; JOI/Zod validation.
- **Database**: MongoDB (Atlas). GridFS or S3‑compatible store for PDFs.
- **Auth**: JWT in httpOnly cookies; refresh rotation; RBAC via middleware; password hashing (bcrypt).
- **Observability**: Winston logs, correlation IDs, centralized error handler.
- **Testing**: Jest + React Testing Library (FE); Jest + Supertest (API); Playwright/Cypress for e2e.
- **CI/CD**: GitHub Actions (lint/test/build); Deploy FE (Vercel/Netlify) & BE (Render/Fly/Heroku‑like).

## 3. Data Model (Collections)
- `doctors`, `geneticists`, `pharmacologists`
- `patients`
- `genes`, `metabolizer_details`
- `medicines`
- `prescriptions`
- `reports`
- `treatment_cases`
- `users` (optional central auth index with `role` + `ref_id`)
- `audits` (append‑only change history)

## 4. Representative Mongoose Schemas (indicative)
```js
// doctor.js
const Doctor = new Schema({ doctor_id: { type: String, unique: true, required: true },
  name: String, licence_id: { type: String, required: true },
  gender: String, email: { type: String, unique: true, required: true },
  mobile_number: String, specialization: String, qualifications: String,
  experience: Number, hospital: String, date_of_birth: Date, password_hash: String
}, { timestamps: true });
```
```js
// geneticist.js & pharmacologist.js similar with their role-specific fields
```
```js
// patient.js
const Patient = new Schema({ patient_id: { type: String, unique: true, required: true },
  patient_name: { type: String, required: true }, gene_id: String, gene_name: String,
  drug_reaction_history: String, weight: Number,
  address: { street: String, city: String, province: String },
  gender: String, health_condition: String, current_medication: String,
  mobile_number: String, allergies: String,
  medicine_id: String, medicine_name: String,
  created_by_doctor_id: String
}, { timestamps: true });
```
```js
// gene.js
const Gene = new Schema({ gene_id: { type: String, unique: true, required: true },
  gene_name: { type: String, required: true }, genetic_variant_type: String,
  metabolizer_status: String
}, { timestamps: true });
```
```js
// medicine.js
const Medicine = new Schema({ medicine_id: { type: String, unique: true, required: true },
  name: { type: String, required: true }, purpose: String,
  drug_interactions: String, allergy_risks: String
}, { timestamps: true });
```
```js
// prescription.js
const Prescription = new Schema({ prescription_id: String,
  patient_id: { type: String, required: true }, medicine_id: { type: String, required: true },
  special_notes: String, created_by_doctor_id: { type: String, required: true }
}, { timestamps: true });
```
```js
// report.js
const Report = new Schema({ report_id: String, owner_role: String, owner_id: String,
  title: { type: String, required: true }, description: String, pdf_file: String,
  approved: { type: Boolean, default: false }, final_decision: String
}, { timestamps: true });
```
```js
// treatment_case.js
const TreatmentCase = new Schema({ case_id: { type: String, unique: true, required: true },
  gene_id: String, medicine_id: String, doctor_id: String, pharmacologist_id: String, geneticist_id: String,
  effectiveness: Number, treatment_time: Number, patient_gender: String, patient_age: Number
}, { timestamps: true });
```
```js
// audit.js
const Audit = new Schema({ entity: String, entity_id: String, actor_role: String, actor_id: String,
  action: String, before: Object, after: Object
}, { timestamps: true });
```

## 5. API Surface (REST, /api/v1)
**Auth**
- POST `/auth/{role}/signup` (role ∈ doctor|geneticist|pharmacologist)
- POST `/auth/{role}/login` → sets httpOnly cookie
- POST `/auth/logout`
- GET  `/auth/me`

**Patients (Doctor only)**
- POST `/patients` · GET `/patients` · GET `/patients/:id` · PUT `/patients/:id` · DELETE `/patients/:id`

**Prescriptions (Doctor only)**
- POST `/prescriptions` · GET `/prescriptions` (`?patient_id=&medicine_id=`) · PUT `/prescriptions/:id` · DELETE `/prescriptions/:id`

**Genes & Metabolizers (Geneticist only)**
- POST `/genes` · GET `/genes` · GET `/genes/:id` · PUT `/genes/:id` · DELETE `/genes/:id`
- POST `/genes/:id/metabolizers` · PUT `/metabolizers/:id` · DELETE `/metabolizers/:id`

**Medicines (Pharmacologist only)**
- POST `/medicines` · GET `/medicines` · GET `/medicines/:id` · PUT `/medicines/:id` · DELETE `/medicines/:id`
- GET `/medicines/:id/variation` (reads audit history)

**Reports (All roles)**
- POST `/reports` (PDF upload) · GET `/reports` (`?owner_role=&approved=`) · PUT `/reports/:id` · DELETE `/reports/:id`

**Admin / Heads**
- GET `/admin/reports?pending=true`
- POST `/admin/reports/:id/decision` `{ final_decision, approved, report_file? }`

**Treatment Analysis (All roles, read-only)**
- GET `/treatment-cases` (`?gene_id=&medicine_id=&doctor_id=&effectiveness_gte=&patient_age_lte=`)
- (Optional) POST `/treatment-cases` if cases are created via UI

## 6. Security Model
- **RBAC**: Middleware checks `req.user.role` and ownership where required.
- **Auth**: JWT (short‑lived access) + refresh token rotation; httpOnly; secure; sameSite.
- **Passwords**: bcrypt with per‑user salt; min length 8; complexity enforcement.
- **Validation**: JOI/Zod on all inputs; central error responses; request rate‑limits on auth endpoints.
- **Uploads**: PDF only; size ≤ 20MB; MIME + magic signature checks; virus scan hook (pluggable).

## 7. File Storage Strategy
- GridFS (Mongo) or S3‑compatible bucket with signed URLs; filenames normalized; metadata stored in `reports` collection; lifecycle policy for old versions.

## 8. Logging, Auditing & Metrics
- **Audit**: append‑only for create/update/delete on Patients, Genes, Medicines, Reports, and Admin decisions.
- **App logs**: structured JSON with request IDs.
- **Metrics**: response time, error rates, file upload failures.

## 9. Testing Strategy
- **Unit**: model & service logic; validators.
- **API**: Supertest for RBAC and CRUD flows.
- **UI**: React Testing Library for forms and table interactions.
- **E2E**: Playwright smoke across roles.
- **Security**: auth bypass tests, IDOR checks, file type enforcement.

## 10. DevOps & Environments
- **Envs**: dev, staging, prod; distinct DBs and buckets.
- **CI**: lint → unit → API tests → build; artifacts versioned.
- **CD**: auto‑deploy main to staging; manual promotion to prod.
- **Backups**: daily dumps; restore drill quarterly.

## 11. Implementation Plan (Milestones)
1. **Foundation**: Landing, Auth (3 roles), RBAC skeleton, dashboards.
2. **Core CRUD**: Patients (Doctor), Genes+Metabolizers (Geneticist), Medicines (Pharmacologist).
3. **Reports**: upload/list/manage; PDF viewer.
4. **Analysis**: Treatment Cases grid; Drug Variation (audit timeline).
5. **Admin**: Head approvals with final decision & status.
6. **Hardening**: validation, access logs, A11y, performance budget; e2e smoke; documentation.

## 12. Risks & Mitigations
- **PHI/PII exposure** → strict RBAC, field redaction, encryption at rest (provider), secure transport.
- **Schema drift** → versioned migrations and validators.
- **Large uploads** → size caps, streaming to storage.
- **Role confusion** → clear navigation + route guards + API role checks.

## 13. Deliverables
- Source code (FE/BE), infrastructure configs, API docs (OpenAPI), seeded sample data, admin account setup, runbook, and this blueprint.
