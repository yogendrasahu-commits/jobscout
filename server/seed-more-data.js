import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data.json');

const raw = fs.readFileSync(DB_PATH, 'utf-8');
const data = JSON.parse(raw);

const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync('password123', salt);

const extraJobs = [
  {
    id: 'job_26',
    employerId: 'usr_emp_2',
    employerName: 'Nexus Cloud Innovations',
    company: 'Nexus Cloud Innovations',
    title: 'Senior QA Automation Engineer (Playwright & TypeScript)',
    category: 'Technology',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experienceLevel: 'Mid-Level',
    minSalary: 1400000,
    salary: '₹14,00,000 - ₹18,00,000 / yr',
    lat: 19.1136,
    lng: 72.8697,
    address: 'MIDC Andheri East, Mumbai',
    description: 'Build automated end-to-end regression suites using Playwright, GitHub Actions, and Jest. Experience in testing WebSockets and real-time streaming interfaces.',
    skills: ['Playwright', 'TypeScript', 'Jest', 'CI/CD', 'API Testing'],
    urgent: false,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
  },
  {
    id: 'job_27',
    employerId: 'usr_emp_7',
    employerName: 'Razorpay Software',
    company: 'Razorpay Software Pvt Ltd',
    title: 'Cloud Security & DevSecOps Engineer',
    category: 'Technology',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experienceLevel: 'Senior',
    minSalary: 2600000,
    salary: '₹26,00,000 - ₹34,00,000 / yr',
    lat: 12.9352,
    lng: 77.6245,
    address: 'Koramangala, Bangalore',
    description: 'Protect financial infrastructure from zero-day threats. Enforce static code analysis, AWS IAM least-privilege policies, and PCI-DSS compliance.',
    skills: ['AWS Security', 'Terraform', 'Vault', 'Kubernetes Security', 'PCI-DSS'],
    urgent: true,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 11).toISOString()
  },
  {
    id: 'job_28',
    employerId: 'usr_emp_3',
    employerName: 'Apex Express Logistics',
    company: 'Apex Express Logistics India',
    title: 'Regional Supply Chain & Route Optimization Analyst',
    category: 'Logistics',
    jobType: 'Full-time',
    workMode: 'Onsite',
    experienceLevel: 'Mid-Level',
    minSalary: 850000,
    salary: '₹70,000 - ₹85,000 / mo',
    lat: 19.0910,
    lng: 72.8860,
    address: 'Sakinaka Junction, Kurla, Mumbai',
    description: 'Analyze GPS telemetry data from over 1,500 delivery vehicles. Optimize inter-city hub transfer times and minimize fuel consumption.',
    skills: ['Route Optimization', 'Python', 'GIS', 'Excel Modeling', 'Logistics'],
    urgent: false,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 13).toISOString()
  },
  {
    id: 'job_29',
    employerId: 'usr_emp_10',
    employerName: 'Postman API Platform',
    company: 'Postman India Solutions',
    title: 'Senior Technical Writer & API Documentation Lead',
    category: 'Technology',
    jobType: 'Full-time',
    workMode: 'Remote',
    experienceLevel: 'Mid-Level',
    minSalary: 1600000,
    salary: '₹16,00,000 - ₹22,00,000 / yr',
    lat: 12.9784,
    lng: 77.6045,
    address: '100% Remote (Pan-India)',
    description: 'Author world-class developer guides, OpenAPI specifications, and interactive tutorials for cutting-edge API protocols.',
    skills: ['Technical Writing', 'OpenAPI', 'Markdown', 'Git', 'REST APIs'],
    urgent: false,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 25).toISOString()
  },
  {
    id: 'job_30',
    employerId: 'usr_emp_11',
    employerName: 'Zomato Hyperlocal Logistics',
    company: 'Zomato Limited',
    title: 'Electric Vehicle (EV) Fleet Operations Lead',
    category: 'Logistics',
    jobType: 'Full-time',
    workMode: 'Onsite',
    experienceLevel: 'Mid-Level',
    minSalary: 900000,
    salary: '₹75,000 - ₹90,000 / mo',
    lat: 28.4595,
    lng: 77.0266,
    address: 'DLF Cyber City, Gurgaon',
    description: 'Oversee transition of two-wheeler delivery fleet to electric scooters and battery-swapping stations across Delhi NCR.',
    skills: ['EV Infrastructure', 'Battery Swapping', 'Fleet Management', 'Operations'],
    urgent: true,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  },
  {
    id: 'job_31',
    employerId: 'usr_emp_4',
    employerName: 'PixelCraft Design Lab',
    company: 'PixelCraft Studio Ltd',
    title: 'Brand Visual Designer & Motion Video Editor',
    category: 'Design',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experienceLevel: 'Mid-Level',
    minSalary: 1200000,
    salary: '₹12,00,000 - ₹16,00,000 / yr',
    lat: 19.0596,
    lng: 72.8295,
    address: 'Bandra West, Mumbai',
    description: 'Produce high-energy brand reels, 3D motion graphics, and typography trailers for product launches on Instagram and YouTube.',
    skills: ['After Effects', 'Premiere Pro', 'Figma', 'Motion Design', 'Cinema 4D'],
    urgent: true,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 32).toISOString()
  },
  {
    id: 'job_32',
    employerId: 'usr_emp_5',
    employerName: 'QuickServe Retail Supermarts',
    company: 'QuickServe Retail Network',
    title: 'Store Inventory Cashier & Spot Billing Associate',
    category: 'Support',
    jobType: 'Hourly',
    workMode: 'Onsite',
    experienceLevel: 'Entry',
    minSalary: 280000,
    salary: '₹22,000 - ₹28,000 / mo (Immediate Joining)',
    lat: 19.0178,
    lng: 72.8478,
    address: 'Dadar West Station Area, Mumbai',
    description: 'Manage POS billing counters, barcode scanning, UPI payment reconciliations, and customer checkouts during festive season.',
    skills: ['POS Billing', 'Cash Handling', 'Barcode Scanning', 'Customer Service'],
    urgent: true,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 35).toISOString()
  },
  {
    id: 'job_33',
    employerId: 'usr_emp_12',
    employerName: 'Groww Wealth Tech',
    company: 'Nextbillion Technology (Groww)',
    title: 'Business Intelligence & SQL Analytics Lead',
    category: 'Finance',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experienceLevel: 'Senior',
    minSalary: 2000000,
    salary: '₹20,00,000 - ₹26,00,000 / yr',
    lat: 12.9141,
    lng: 77.6411,
    address: 'HSR Layout, Bangalore',
    description: 'Build executive cohort analysis dashboards, track trade volume trends, and collaborate with growth marketers on retention loops.',
    skills: ['SQL', 'Tableau', 'PowerBI', 'Snowflake', 'Cohort Analysis'],
    urgent: false,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
  },
  {
    id: 'job_34',
    employerId: 'usr_emp_14',
    employerName: 'Hasura GraphQL Systems',
    company: 'Hasura Technologies',
    title: 'Rust & WebAssembly Performance Systems Specialist',
    category: 'Technology',
    jobType: 'Full-time',
    workMode: 'Remote',
    experienceLevel: 'Senior',
    minSalary: 3200000,
    salary: '₹32,00,000 - ₹45,00,000 / yr',
    lat: 17.4399,
    lng: 78.3807,
    address: '100% Remote / Pan-India',
    description: 'Implement zero-copy JSON parsing engines and WebAssembly execution runtimes in Rust for next-gen distributed database connectors.',
    skills: ['Rust', 'WebAssembly', 'C++', 'Concurrency', 'Systems Programming'],
    urgent: true,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 45).toISOString()
  },
  {
    id: 'job_35',
    employerId: 'usr_emp_6',
    employerName: 'PrimeCare Diagnostic Centers',
    company: 'PrimeCare Health Systems',
    title: 'Medical Laboratory Technician & Phlebotomist',
    category: 'Healthcare',
    jobType: 'Full-time',
    workMode: 'Onsite',
    experienceLevel: 'Entry',
    minSalary: 380000,
    salary: '₹28,000 - ₹35,000 / mo + Travel Allowance',
    lat: 19.0330,
    lng: 72.8550,
    address: 'Parel Diagnostic Wing, Mumbai',
    description: 'Perform home blood sample collections across South Mumbai and operate automated hematology analyzers with high sanitary care.',
    skills: ['Phlebotomy', 'Lab Diagnostics', 'Sample Collection', 'DMLT Certified'],
    urgent: true,
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString()
  }
];

const existingJobIds = new Set(data.jobs.map(j => j.id));
for (const j of extraJobs) {
  if (!existingJobIds.has(j.id)) {
    data.jobs.push(j);
    existingJobIds.add(j.id);
  }
}

fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ Added extra jobs! Total jobs now:', data.jobs.length);
