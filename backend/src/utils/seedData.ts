import fs from 'node:fs/promises';
import path from 'node:path';

import { Application } from '../models/Application.ts';
import { Company } from '../models/Company.ts';
import { Job } from '../models/Job.ts';
import { Notification } from '../models/Notification.ts';
import { SavedJob } from '../models/SavedJob.ts';
import { User } from '../models/User.ts';
import { analyzeResumeBuffer } from '../services/resumeAnalyzer.ts';

function buildMinimalSamplePdf(textLines: string[]): Buffer {
  const escapedLines = textLines
    .map(line =>
      line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    )
    .map((line, i) =>
      `BT /F1 11 Tf 54 ${740 - i * 18} Td (${line}) Tj ET`
    )
    .join('\n');

  const streamContent = `${escapedLines}\n`;

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${Buffer.byteLength(streamContent, 'utf8')} >> stream\n${streamContent}endstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${obj}\n`;
  }

  const xrefPos = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (const off of offsets) {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

export async function seedDatabaseIfEmpty(): Promise<void> {
  const existingUsers = await User.countDocuments();

  if (existingUsers > 0) {
    console.log('[Seed] Database already contains users. Skipping seed.');
    return;
  }

  console.log('[Seed] Initializing MP Job Portal...');

  const resumeDir = path.resolve(process.cwd(), 'uploads/resumes');
  await fs.mkdir(resumeDir, { recursive: true });

  const samplePdfBuffer = buildMinimalSamplePdf([
    'Rahul Sharma - Senior Full Stack Developer',
    'Indore, Madhya Pradesh | rahul.sharma@example.com',
    'SUMMARY',
    'Full-stack developer with 5+ years of experience.',
    'Experienced in React, Node.js, Express and MongoDB.',
    'EXPERIENCE',
    'Senior Developer - Malwa Digital Technologies (2022 - Present)',
    'Developed scalable MERN applications and REST APIs.',
    'Software Developer - Narmada Infotech (2019 - 2022)',
    'Built responsive websites and enterprise applications.',
    'EDUCATION',
    'B.Tech Computer Science - DAVV Indore',
    'SKILLS',
    'React, JavaScript, TypeScript, Node.js, Express, MongoDB, MySQL, AWS',
  ]);

  const sampleResumePath = path.join(
    resumeDir,
    'sample-resume-rahul-sharma.pdf'
  );

  await fs.writeFile(sampleResumePath, samplePdfBuffer);

  const sampleAnalysis = analyzeResumeBuffer(samplePdfBuffer, [
    'React',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'MongoDB',
    'Express',
  ]);

  // JOB SEEKER 1

  const seeker1 = await User.create({
    fullName: 'Rahul Sharma',
    email: 'seeker@mpjobs.in',
    password: 'Password123!',
    phone: '+91 9876543210',
    role: 'jobseeker',
    profileImage: '/src/assets/images/avatar_seeker_demo_1795108888973.jpg',
    headline: 'Senior Full Stack Developer | MERN Stack',
    bio: 'Software developer from Indore specializing in scalable web applications and backend architecture.',
    location: 'Indore, Madhya Pradesh',
    skills: [
      'React',
      'JavaScript',
      'TypeScript',
      'Node.js',
      'Express',
      'MongoDB',
      'MySQL',
      'AWS',
      'Redux',
    ],
    experience: [
      {
        title: 'Senior Full Stack Developer',
        company: 'Malwa Digital Technologies',
        location: 'Indore, Madhya Pradesh',
        startDate: '2022-04',
        current: true,
        description: 'Developing MERN stack applications and REST APIs.',
      },
      {
        title: 'Software Developer',
        company: 'Narmada Infotech Solutions',
        location: 'Indore, Madhya Pradesh',
        startDate: '2019-06',
        endDate: '2022-03',
        current: false,
        description: 'Developed responsive websites and dashboards.',
      },
    ],
    education: [
      {
        degree: 'B.Tech Computer Science',
        institution: 'Institute of Engineering and Technology, DAVV',
        field: 'Computer Science',
        year: '2019',
      },
    ],
    resume: {
      url: '/uploads/resumes/sample-resume-rahul-sharma.pdf',
      originalName: 'Rahul_Sharma_Resume.pdf',
      size: samplePdfBuffer.length,
      uploadedAt: new Date(),
      analysis: sampleAnalysis,
    },
  });

  // JOB SEEKER 2

  const seeker2 = await User.create({
    fullName: 'Priya Verma',
    email: 'priya.verma@example.com',
    password: 'Password123!',
    phone: '+91 9876543211',
    role: 'jobseeker',
    headline: 'UI/UX Designer | Product Designer',
    bio: 'Creative UI/UX designer specializing in mobile applications and modern digital experiences.',
    location: 'Bhopal, Madhya Pradesh',
    skills: [
      'Figma',
      'UI/UX',
      'Adobe XD',
      'Photoshop',
      'Illustrator',
      'Wireframing',
      'Prototyping',
      'User Research',
    ],
    experience: [
      {
        title: 'UI/UX Designer',
        company: 'Bhopal Creative Studio',
        location: 'Bhopal, Madhya Pradesh',
        startDate: '2022-01',
        current: true,
        description: 'Designing mobile applications and interactive prototypes.',
      },
    ],
    education: [
      {
        degree: 'B.Des Communication Design',
        institution: 'National Institute of Design',
        field: 'Design',
        year: '2021',
      },
    ],
    resume: {
      url: '/uploads/resumes/sample-resume-rahul-sharma.pdf',
      originalName: 'Priya_Verma_Resume.pdf',
      size: samplePdfBuffer.length,
      uploadedAt: new Date(),
      analysis: sampleAnalysis,
    },
  });

  // JOB SEEKER 3

  const seeker3 = await User.create({
    fullName: 'Amit Patel',
    email: 'amit.patel@example.com',
    password: 'Password123!',
    phone: '+91 9876543212',
    role: 'jobseeker',
    headline: 'Digital Marketing Executive',
    bio: 'Digital marketing professional with experience in SEO, Google Ads and social media marketing.',
    location: 'Ujjain, Madhya Pradesh',
    skills: [
      'SEO',
      'Google Ads',
      'Social Media Marketing',
      'Content Writing',
      'Google Analytics',
      'Email Marketing',
    ],
    experience: [
      {
        title: 'Digital Marketing Executive',
        company: 'Malwa Media Solutions',
        location: 'Ujjain, Madhya Pradesh',
        startDate: '2023-02',
        current: true,
        description: 'Managing SEO campaigns and digital marketing strategies.',
      },
    ],
    education: [
      {
        degree: 'MBA Marketing',
        institution: 'Devi Ahilya Vishwavidyalaya',
        field: 'Marketing',
        year: '2022',
      },
    ],
  });

  // RECRUITER 1

  const recruiter1 = await User.create({
    fullName: 'Anjali Mehta',
    email: 'recruiter@mpjobs.in',
    password: 'Password123!',
    phone: '+91 9876543220',
    role: 'recruiter',
    profileImage: '/src/assets/images/avatar_recruiter_demo_1795108888993.jpg',
    headline: 'HR Manager | Malwa Digital Technologies',
    location: 'Indore, Madhya Pradesh',
  });

  // RECRUITER 2

  const recruiter2 = await User.create({
    fullName: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    password: 'Password123!',
    phone: '+91 9876543221',
    role: 'recruiter',
    headline: 'Talent Acquisition Lead',
    location: 'Bhopal, Madhya Pradesh',
  });

  // ADMIN

  await User.create({
    fullName: 'Neha Jain',
    email: 'admin@mpjobs.in',
    password: 'Password123!',
    phone: '+91 9876543230',
    role: 'admin',
    headline: 'MP Jobs Platform Administrator',
    location: 'Indore, Madhya Pradesh',
  });

  // COMPANIES

  const companies = await Company.insertMany([
    {
      name: 'Malwa Digital Technologies',
      description: 'Demo Indore-based IT company specializing in MERN stack applications, websites and enterprise software.',
      banner: '/src/assets/images/company_campus_banner_1795108889735.jpg',
      website: 'https://malwadigital.example.com',
      location: 'Indore, Madhya Pradesh',
      industry: 'Information Technology',
      size: '50-200 employees',
      foundedYear: 2018,
      recruiter: recruiter1._id,
      isVerified: true,
    },
    {
      name: 'Bhopal Creative Studio',
      description: 'Demo creative company working on UI/UX design, branding and digital experiences.',
      banner: '/src/assets/images/hero_modern_workspace_1795108889649.jpg',
      website: 'https://bhopalcreative.example.com',
      location: 'Bhopal, Madhya Pradesh',
      industry: 'Design & Technology',
      size: '20-50 employees',
      foundedYear: 2020,
      recruiter: recruiter1._id,
      isVerified: true,
    },
    {
      name: 'Narmada Infotech Solutions',
      description: 'Demo software company specializing in cloud applications and IT consulting.',
      website: 'https://narmadainfotech.example.com',
      location: 'Jabalpur, Madhya Pradesh',
      industry: 'Software Development',
      size: '100-250 employees',
      foundedYear: 2017,
      recruiter: recruiter2._id,
      isVerified: true,
    },
    {
      name: 'Pithampur Industrial Automation',
      description: 'Demo industrial technology company focused on manufacturing automation and engineering.',
      website: 'https://pithampurautomation.example.com',
      location: 'Pithampur, Madhya Pradesh',
      industry: 'Manufacturing & Automation',
      size: '200-500 employees',
      foundedYear: 2016,
      recruiter: recruiter2._id,
      isVerified: true,
    },
    {
      name: 'Malwa Media Solutions',
      description: 'Demo digital marketing agency providing SEO, Google Ads and social media services.',
      website: 'https://malwamedia.example.com',
      location: 'Ujjain, Madhya Pradesh',
      industry: 'Digital Marketing',
      size: '20-50 employees',
      foundedYear: 2021,
      recruiter: recruiter1._id,
      isVerified: true,
    },
    {
      name: 'Vindhya Business Technologies',
      description: 'Demo business technology company offering financial software and business analytics.',
      website: 'https://vindhyabusiness.example.com',
      location: 'Dewas, Madhya Pradesh',
      industry: 'Business Technology',
      size: '50-200 employees',
      foundedYear: 2019,
      recruiter: recruiter2._id,
      isVerified: true,
    },
  ]);

  const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const inFortyFiveDays = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

  // JOBS

  const jobs = await Job.insertMany([
    {
      title: 'Senior Full Stack Developer (MERN Stack)',
      description: 'Join Malwa Digital Technologies in Indore and develop scalable web applications and REST APIs using React, Node.js and MongoDB.',
      requirements: [
        '3+ years experience in React and Node.js',
        'Strong knowledge of JavaScript and TypeScript',
        'Experience with MongoDB and Express',
        'Knowledge of REST APIs and Git',
      ],
      benefits: [
        'Competitive salary',
        'Flexible working hours',
        'Learning allowance',
        'Health insurance',
      ],
      company: companies[0]._id,
      recruiter: recruiter1._id,
      location: 'Indore, Madhya Pradesh',
      salary: { min: 600000, max: 1200000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'Hybrid',
      experience: 'Senior',
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
      vacancies: 3,
      deadline: inFortyFiveDays,
      category: 'Software Engineering',
      status: 'active',
      isFeatured: true,
      applicantCount: 2,
    },
    {
      title: 'UI/UX Designer',
      description: 'Create modern websites, mobile applications, wireframes and user-friendly digital experiences.',
      requirements: [
        '2+ years UI/UX experience',
        'Strong knowledge of Figma',
        'Understanding of responsive design',
        'Experience with prototyping',
      ],
      benefits: ['Creative work environment', 'Flexible schedule', 'Professional development'],
      company: companies[1]._id,
      recruiter: recruiter1._id,
      location: 'Bhopal, Madhya Pradesh',
      salary: { min: 400000, max: 800000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'Hybrid',
      experience: 'Mid Level',
      skills: ['Figma', 'UI/UX', 'Adobe XD', 'Prototyping', 'Wireframing'],
      vacancies: 2,
      deadline: inThirtyDays,
      category: 'Product Design',
      status: 'active',
      isFeatured: true,
      applicantCount: 1,
    },
    {
      title: 'Cloud & DevOps Engineer',
      description: 'Manage cloud infrastructure, Docker containers, Kubernetes clusters and automated deployment pipelines.',
      requirements: [
        '3+ years cloud experience',
        'Knowledge of AWS and Azure',
        'Experience with Docker and Kubernetes',
        'Understanding of CI/CD',
      ],
      benefits: ['Competitive salary', 'Remote flexibility', 'Certification support'],
      company: companies[2]._id,
      recruiter: recruiter2._id,
      location: 'Jabalpur, Madhya Pradesh',
      salary: { min: 700000, max: 1400000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'Remote',
      experience: 'Senior',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD'],
      vacancies: 2,
      deadline: inFortyFiveDays,
      category: 'DevOps & Cloud',
      status: 'active',
      isFeatured: true,
      applicantCount: 0,
    },
    {
      title: 'Mechanical Engineer',
      description: 'Work on manufacturing systems, production processes, quality improvement and industrial machinery.',
      requirements: [
        'B.E. or B.Tech Mechanical Engineering',
        'Knowledge of AutoCAD and SolidWorks',
        'Understanding of manufacturing',
        'Good problem-solving skills',
      ],
      benefits: ['Transportation assistance', 'Medical insurance', 'Career growth'],
      company: companies[3]._id,
      recruiter: recruiter2._id,
      location: 'Pithampur, Madhya Pradesh',
      salary: { min: 350000, max: 650000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'On-site',
      experience: 'Mid Level',
      skills: ['AutoCAD', 'SolidWorks', 'Mechanical Design', 'Manufacturing'],
      vacancies: 4,
      deadline: inThirtyDays,
      category: 'Engineering',
      status: 'active',
      isFeatured: true,
      applicantCount: 0,
    },
    {
      title: 'Digital Marketing Executive',
      description: 'Manage SEO campaigns, Google Ads, social media marketing and digital branding campaigns.',
      requirements: [
        '1-3 years marketing experience',
        'Knowledge of SEO and Google Ads',
        'Understanding of social media',
        'Basic Google Analytics knowledge',
      ],
      benefits: ['Performance incentives', 'Flexible hours', 'Marketing training'],
      company: companies[4]._id,
      recruiter: recruiter1._id,
      location: 'Ujjain, Madhya Pradesh',
      salary: { min: 250000, max: 450000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'Hybrid',
      experience: 'Entry Level',
      skills: ['SEO', 'Google Ads', 'Social Media Marketing', 'Google Analytics', 'Content Writing'],
      vacancies: 3,
      deadline: inFortyFiveDays,
      category: 'Marketing & Growth',
      status: 'active',
      isFeatured: false,
      applicantCount: 0,
    },
    {
      title: 'Data Analyst',
      description: 'Analyze business data, prepare reports and create interactive dashboards for business decisions.',
      requirements: [
        'Bachelor degree in Computer Science or Statistics',
        'Strong SQL knowledge',
        'Experience with Excel and Power BI',
        'Basic Python knowledge',
      ],
      benefits: ['Performance bonus', 'Health coverage', 'Learning allowance'],
      company: companies[5]._id,
      recruiter: recruiter2._id,
      location: 'Dewas, Madhya Pradesh',
      salary: { min: 400000, max: 750000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'Hybrid',
      experience: 'Mid Level',
      skills: ['SQL', 'Python', 'Excel', 'Power BI', 'Data Analysis'],
      vacancies: 2,
      deadline: inThirtyDays,
      category: 'Data & AI',
      status: 'active',
      isFeatured: false,
      applicantCount: 0,
    },
    {
      title: 'Backend Developer (Node.js & MongoDB)',
      description: 'Develop secure REST APIs, backend services and database systems for web applications.',
      requirements: [
        '2+ years Node.js experience',
        'Knowledge of Express.js',
        'Strong MongoDB knowledge',
        'Experience with REST APIs',
      ],
      benefits: ['Remote working options', 'Paid leaves', 'Technical learning budget'],
      company: companies[0]._id,
      recruiter: recruiter1._id,
      location: 'Indore, Madhya Pradesh',
      salary: { min: 450000, max: 850000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'Remote',
      experience: 'Mid Level',
      skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API'],
      vacancies: 2,
      deadline: inFortyFiveDays,
      category: 'Software Engineering',
      status: 'active',
      isFeatured: false,
      applicantCount: 0,
    },
    {
      title: 'HR Executive',
      description: 'Handle recruitment, employee onboarding, candidate screening and HR operations.',
      requirements: [
        'MBA in HR or equivalent',
        'Good communication skills',
        'Understanding of recruitment',
        'Knowledge of MS Office',
      ],
      benefits: ['Professional development', 'Performance incentives'],
      company: companies[5]._id,
      recruiter: recruiter2._id,
      location: 'Dewas, Madhya Pradesh',
      salary: { min: 250000, max: 450000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'On-site',
      experience: 'Entry Level',
      skills: ['Recruitment', 'Human Resources', 'Communication', 'MS Office'],
      vacancies: 2,
      deadline: inThirtyDays,
      category: 'Human Resources',
      status: 'active',
      isFeatured: false,
      applicantCount: 0,
    },
    {
      title: 'Software Developer Intern',
      description: 'Learn practical web development while working on real software projects with our Indore development team.',
      requirements: [
        'Pursuing B.Tech, BCA or MCA',
        'Basic HTML, CSS and JavaScript',
        'React knowledge is an advantage',
        'Willingness to learn',
      ],
      benefits: ['Internship certificate', 'Developer mentorship', 'Project experience'],
      company: companies[0]._id,
      recruiter: recruiter1._id,
      location: 'Indore, Madhya Pradesh',
      salary: { min: 8000, max: 15000, currency: 'INR', period: 'monthly' },
      jobType: 'Internship',
      workMode: 'On-site',
      experience: 'Entry Level',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
      vacancies: 5,
      deadline: inThirtyDays,
      category: 'Software Engineering',
      status: 'active',
      isFeatured: false,
      applicantCount: 0,
    },
    {
      title: 'Accountant',
      description: 'Manage financial records, GST documentation, invoices and monthly financial reports.',
      requirements: [
        'B.Com or M.Com qualification',
        'Knowledge of Tally Prime',
        'Understanding of GST',
        'Good Excel skills',
      ],
      benefits: ['Stable work environment', 'Annual salary review', 'Paid leaves'],
      company: companies[5]._id,
      recruiter: recruiter2._id,
      location: 'Dewas, Madhya Pradesh',
      salary: { min: 250000, max: 450000, currency: 'INR', period: 'yearly' },
      jobType: 'Full-time',
      workMode: 'On-site',
      experience: 'Mid Level',
      skills: ['Tally', 'GST', 'Accounting', 'MS Excel', 'Finance'],
      vacancies: 1,
      deadline: inFortyFiveDays,
      category: 'Finance & Accounting',
      status: 'active',
      isFeatured: false,
      applicantCount: 0,
    },
  ]);
  
  // APPLICATIONS

  const interviewDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

  await Application.insertMany([
    {
      job: jobs[0]._id,
      applicant: seeker1._id,
      recruiter: recruiter1._id,
      resume: {
        url: '/uploads/resumes/sample-resume-rahul-sharma.pdf',
        originalName: 'Rahul_Sharma_Resume.pdf',
      },
      coverLetter: 'I have 5+ years of experience developing MERN stack applications and scalable APIs. I would love to contribute to Malwa Digital Technologies.',
      status: 'interview',
      interviewDate,
      interviewMode: 'Video',
      interviewLink: 'https://meet.example.com/indore-interview',
      recruiterNotes: 'Strong MERN stack experience. Selected for technical interview.',
    },
    {
      job: jobs[1]._id,
      applicant: seeker2._id,
      recruiter: recruiter1._id,
      resume: {
        url: '/uploads/resumes/sample-resume-rahul-sharma.pdf',
        originalName: 'Priya_Verma_Resume.pdf',
      },
      coverLetter: 'I have professional experience in UI/UX design and Figma. I am interested in joining your creative team.',
      status: 'shortlisted',
      recruiterNotes: 'Good design portfolio and UI/UX knowledge.',
    },
    {
      job: jobs[4]._id,
      applicant: seeker3._id,
      recruiter: recruiter1._id,
      resume: {
        url: '/uploads/resumes/sample-resume-rahul-sharma.pdf',
        originalName: 'Amit_Patel_Resume.pdf',
      },
      coverLetter: 'I have practical experience in SEO, Google Ads and social media marketing.',
      status: 'pending',
    },
  ]);

  // SAVED JOBS

  await SavedJob.insertMany([
    { user: seeker1._id, job: jobs[6]._id },
    { user: seeker1._id, job: jobs[0]._id },
    { user: seeker2._id, job: jobs[1]._id },
    { user: seeker3._id, job: jobs[4]._id },
  ]);

  // NOTIFICATIONS

  await Notification.insertMany([
    {
      user: seeker1._id,
      title: 'Interview Scheduled: Senior Full Stack Developer',
      message: 'Anjali Mehta scheduled your video interview at Malwa Digital Technologies, Indore.',
      type: 'interview',
      link: '/seeker/applications',
      isRead: false,
    },
    {
      user: seeker1._id,
      title: 'Resume Analysis Completed',
      message: `Your resume scored ${sampleAnalysis.score}/100 with ${sampleAnalysis.detectedSkills.length} recognized technical skills.`,
      type: 'system',
      link: '/seeker/profile',
      isRead: true,
    },
    {
      user: recruiter1._id,
      title: 'New Candidate Application',
      message: 'Priya Verma applied for UI/UX Designer at Bhopal Creative Studio.',
      type: 'application',
      link: '/recruiter/applicants',
      isRead: false,
    },
    {
      user: seeker2._id,
      title: 'Application Shortlisted',
      message: 'Your UI/UX Designer application has been shortlisted.',
      type: 'application',
      link: '/seeker/applications',
      isRead: false,
    },
    {
      user: seeker3._id,
      title: 'Application Submitted',
      message: 'Your Digital Marketing Executive application was submitted successfully.',
      type: 'application',
      link: '/seeker/applications',
      isRead: false,
    },
  ]);

  console.log('[Seed] MP Job Portal database seeded successfully!');
  console.log('[Seed] Companies:', companies.length);
  console.log('[Seed] Jobs:', jobs.length);
  console.log('[Seed] Job Seekers: 3');
  console.log('[Seed] Recruiters: 2');
}

