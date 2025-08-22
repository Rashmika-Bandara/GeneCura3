# GeneCura — User Requirements Specification (URS)
**Version:** 1.0  
**Date:** 2025-08-19  
**Stack Target:** MERN (MongoDB, Express, React, Node.js)

---

## 1. Purpose
Define clear, testable requirements for **GeneCura**, a role‑based web application that analyzes how **genetic differences affect drug response**. This URS converts the narrative + ERD into concrete behavior the product must deliver.

## 2. Scope
- In-scope: Role-based auth, CRUD on Patients/Genes/Medicines as per role, Prescriptions (notes), Reports with Head approval, Treatment Analysis view, Drug Variation Analysis (audit timeline), Admin panel for Heads.
- Out-of-scope (v1): Clinical decision engines, EMR integrations, billing, inventory/stock, real-time genomics pipelines, scheduling, notifications.

## 3. Actors & Roles
### 3.1 Doctor
- **Can**: CRUD Patients; CRUD Prescriptions (special notes per patient+medicine); CRUD own Reports; View Treatment Analysis.
- **Cannot**: Edit Genes or Medicines; approve reports.
### 3.2 Clinical Geneticist
- **Can**: CRUD Genes; CRUD Metabolizer Details; CRUD own Reports; View Treatment Analysis.
- **Cannot**: Edit Patients or Medicines; approve reports.
### 3.3 Clinical Pharmacologist
- **Can**: CRUD Medicines; View Drug Variation Analysis; CRUD own Reports; View Treatment Analysis.
- **Cannot**: Edit Patients or Genes; approve reports.
### 3.4 Heads / Admin Panel
- Head of Doctors, Head of Clinical Geneticists, Head of Clinical Pharmacologists.
- **Can**: Log in as normal role; access Admin Panel; Review & Approve/Reject Reports with final decision paragraph and optional admin PDF; view all reports.

## 4. User Journeys & Navigation
### 4.1 Landing Page
- Three vertically separated panels with buttons: **Doctor**, **Clinical Geneticist**, **Clinical Pharmacologist**.
- Clicking a panel opens the **role-specific Auth Hub** (Login / Sign‑up).

### 4.2 Authentication
- **Login**: `{user_id, password}`; success → role dashboard.
- **Sign‑up** (per role), then redirect back to that role’s Login.
- Password policy: ≥ 8 chars, at least 1 letter and 1 number.
- Sessions via JWT in httpOnly cookies; logout clears session; idle timeout (e.g., 30 min).

### 4.3 Dashboards
- **Doctor**: 1) Manage Patients, 2) Manage Prescriptions, 3) Manage Reports, 4) Treatment Analysis.
- **Clinical Geneticist**: 1) Manage Genes, 2) Metabolizer Details, 3) Manage Reports, 4) Treatment Analysis.
- **Clinical Pharmacologist**: 1) Manage Drugs, 2) Drug Variation Analysis, 3) Manage Reports, 4) Treatment Analysis.
- **Heads/Admin**: Review & approval queue; decision form.

## 5. Data Model (entities & attributes)
**Doctor**: doctor_id*, name*, licence_id*, gender, email*, mobile_number*, specialization, qualifications, experience, hospital, date_of_birth*  
**Clinical Geneticist**: geneticist_id*, email*, name*, mobile_number*, date_of_birth*, gender, experience, working_place, licence_id*, qualifications  
**Clinical Pharmacologist**: pharmacologist_id*, name*, email*, mobile_number*, date_of_birth*, gender, experience, working_place, licence_id*, qualifications  
**Patient**: patient_id*, patient_name*, gene_id, gene_name, drug_reaction_history, weight, address(street/city/province), gender, health_condition, current_medication, mobile_number, allergies, medicine_id, medicine_name  
**Gene**: gene_id*, gene_name*, genetic_variant_type, metabolizer_status  
**MetabolizerDetail**: metabolizer_id, gene_id*, status_label (e.g., poor/normal/ultra‑rapid), notes, timestamps  
**Medicine**: medicine_id*, name*, purpose, drug_interactions, allergy_risks  
**Prescription**: prescription_id, patient_id*, medicine_id*, special_notes, created_by_doctor_id*, timestamps  
**Report**: report_id, owner_role, owner_id, title*, description, pdf_file, approved (bool, default false), final_decision (text, admin only), timestamps  
**TreatmentCase**: case_id, gene_id, medicine_id, doctor_id, pharmacologist_id, geneticist_id, effectiveness, treatment_time, patient_gender, patient_age, timestamps  
\* required at sign‑up or creation.

## 6. Functional Requirements (testable)
### 6.1 Common
1. Landing page shows three role panels; each routes to the correct Auth Hub.
2. Role‑specific Sign‑up forms collect the exact attributes; success → redirect to role Login.
3. Login sets a secure session (httpOnly cookie); Logout clears it.
4. Lists provide search, filter, sort, and pagination (default 10/page).

### 6.2 Doctor
- **Manage Patients (CRUD)**: create/edit/delete patient; unique patient_id; validate optional gene_id & medicine_id existence.
- **Manage Prescriptions (CRUD)**: add/edit/delete {patient_id, medicine_id, special_notes}; only creator can modify.
- **Manage Reports (CRUD)**: upload/view/edit/delete own reports; see approval status.
- **Treatment Analysis (Read)**: view table with fields: gene_id, medicine_id, case_id, doctor_id, pharmacologist_id, geneticist_id, effectiveness, treatment_time, patient_gender, patient_age; filter & CSV export.

### 6.3 Clinical Geneticist
- **Manage Genes (CRUD)**: unique gene_id; gene_name unique (case‑insensitive).
- **Metabolizer Details (CRUD)**: add/update/delete per gene_id; show history.
- **Manage Reports (CRUD)**; **Treatment Analysis (Read)** as above.

### 6.4 Clinical Pharmacologist
- **Manage Drugs (CRUD)** on Medicine: unique medicine_id; unique name (case‑insensitive).
- **Drug Variation Analysis (Read)**: show audit timeline of field changes with who/when/what.
- **Manage Reports (CRUD)**; **Treatment Analysis (Read)** as above.

### 6.5 Heads/Admin Panel
1. See all reports with filters (owner role, date, status).  
2. Approve/Reject with **final_decision** paragraph and optional admin PDF.  
3. All decisions audit‑logged; only Heads can alter approval state.

## 7. Role–Permission Matrix
| Feature / Entity | Doctor | Clinical Geneticist | Clinical Pharmacologist | Heads |
|---|:---:|:---:|:---:|:---:|
| Patients | **CRUD** | Read | Read | Read |
| Prescriptions | **CRUD (own)** | Read | Read | Read |
| Genes | Read | **CRUD** | Read | Read |
| Metabolizer details | Read | **CRUD** | Read | Read |
| Medicines | Read | Read | **CRUD** | Read |
| Reports (own) | **CRUD** | **CRUD** | **CRUD** | Read |
| Report approval | — | — | — | **Approve/Reject** |
| Treatment Analysis | Read | Read | Read | Read |

## 8. Validation Rules
- IDs: `^[A-Z0-9_-]{4,20}$` unique per collection.
- Email valid and unique (per role). Mobile with optional `+CC`, 10–15 digits.
- date_of_birth must be in the past; experience ≥ 0.
- weight 1–500 kg (configurable). Address fields required together.
- Block deletion of referenced Genes/Medicines/Patients unless soft‑deleted by Head with reason.

## 9. Non‑Functional Requirements
**Security**: JWT + RBAC, bcrypt hashes, input validation, rate limiting, TLS, minimal logging of PII; CSRF on state‑changing requests if not cookie‑only.  
**Performance**: P95 API < 500ms for list endpoints (10/page); P95 page load < 3s on 4G.  
**Reliability**: Daily backups; RPO ≤ 24h; log retention 90 days.  
**A11y**: WCAG AA; keyboard nav; responsive design.  
**Auditability**: who/when/what on create/update/delete for key entities.  
**Internationalization**: labels externalized for future i18n.

## 10. Acceptance Criteria (summary)
1) Role picker → correct Auth Hub; 2) Sign‑up captures correct fields; 3) RBAC enforced; 4) Doctor CRUD Patients; 5) Geneticist CRUD Genes; 6) Pharmacologist CRUD Medicines; 7) Reports uploaded and visible in Admin queue; 8) Heads approve/reject with decision text; 9) Treatment Analysis grid filters & exports; 10) PDF upload ≤ 20MB only.

## 11. Assumptions & Dependencies
- MongoDB Atlas; modern evergreen browsers; stable network; storage for PDFs via GridFS or S3‑compatible.

## 12. Risks (selected)
- PHI/PII handling; improper RBAC; large file uploads; schema drift. Mitigate with strong validation, audit, tests, quotas.

## 13. Glossary
- **CRUD**: Create/Read/Update/Delete. **RBAC**: Role‑Based Access Control.
