export interface Industry {
  slug: string;
  name: string;
  problem: string;
  built: string;
}

export const industries: Industry[] = [
  {
    slug: 'smes',
    name: 'SMEs & Startups',
    problem: 'Running on spreadsheets, WhatsApp groups and manual follow-ups while growth outpaces the process.',
    built: 'POS, inventory, invoicing and lightweight CRM that a small team can actually run.',
  },
  {
    slug: 'corporates',
    name: 'Corporates & Enterprise',
    problem: 'Disconnected departments, duplicate data entry and no single version of the truth.',
    built: 'Integrated platforms, role-based access and audit trails that scale with headcount.',
  },
  {
    slug: 'education',
    name: 'Schools & Institutions',
    problem: 'Fees tracked in registers, results compiled by hand, parents chasing for updates.',
    built: 'School management with admissions, fees, results, and parent portals.',
  },
  {
    slug: 'retail',
    name: 'Retail & Hospitality',
    problem: 'Stock levels unknown, margins guessed, and every location reporting differently.',
    built: 'Multi-branch POS and inventory with consolidated reporting.',
  },
  {
    slug: 'logistics',
    name: 'Logistics & Transport',
    problem: 'Dispatch by phone call, no visibility on vehicles, costs unknown until month end.',
    built: 'Fleet, dispatch, tracking, fuel and maintenance in one system.',
  },
  {
    slug: 'financial-services',
    name: 'Financial & Professional Services',
    problem: 'Compliance deadlines, client records and reporting spread across disconnected tools.',
    built: 'Secure client management, document workflows and reporting with controlled access.',
  },
];

export interface CaseStudy {
  slug: string;
  client: string;
  title: string;
  industry: string;
  challenge: string;
  solution: string;
  features: string[];
  tech: string[];
  status: 'Live system' | 'In delivery' | 'Completed';
  accent: 'jade' | 'azure' | 'signal';
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'jipangishe',
    client: 'Jipangishe',
    title: 'Platform rebuild for a growing digital business',
    industry: 'Technology / Services',
    challenge:
      'A fast-growing business running on a website that could not carry its own weight — slow pages, no self-service for customers and content changes that required a developer every time.',
    solution:
      'A full rebuild on a modern stack: fast server-rendered pages, a customer-facing portal for self-service, and a content structure the internal team can maintain themselves.',
    features: [
      'Server-rendered, SEO-ready page architecture',
      'Customer self-service portal',
      'Editable content sections, no code required',
      'Instrumented analytics and conversion tracking',
    ],
    tech: ['Astro', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    status: 'Live system',
    accent: 'jade',
  },
  {
    slug: 'qx-carwash',
    client: 'QX Carwash',
    title: 'Booking and operations system for a multi-site service business',
    industry: 'Service / Automotive',
    challenge:
      'Bookings taken manually across calls and messages, staff and bays scheduled by memory, and no reliable record of which vehicle was being serviced when.',
    solution:
      'A booking-to-dispatch platform: customers book a slot online, staff see the day at a glance, and each job is tracked through the service workflow from intake to handover.',
    features: [
      'Online booking with slot availability',
      'Daily schedule and bay assignment',
      'Vehicle and customer history',
      'Service records per vehicle',
    ],
    tech: ['Custom web platform', 'TypeScript', 'Admin dashboard'],
    status: 'Live system',
    accent: 'azure',
  },
  {
    slug: 'carlink-tanzania',
    client: 'Carlink Tanzania',
    title: 'Digital storefront and enquiry platform',
    industry: 'Automotive / Retail',
    challenge:
      'Product enquiry handled over scattered channels with no capture, no follow-up structure and no visibility on which listings actually converted.',
    solution:
      'A fast, mobile-first storefront with structured enquiry capture, lead tracking and an internal view of every conversation and its next step.',
    features: [
      'Mobile-first product listings',
      'Structured lead capture per listing',
      'Lead status and follow-up tracking',
      'Conversion reporting per listing',
    ],
    tech: ['Custom web platform', 'TypeScript', 'Analytics instrumentation'],
    status: 'Live system',
    accent: 'signal',
  },
];

export interface ProcessStep {
  step: string;
  title: string;
  body: string;
  deliverable: string;
}

export const process: ProcessStep[] = [
  {
    step: '01',
    title: 'Discovery & process mapping',
    body: 'We map how work actually moves through your business today — who does what, where data is re-entered, and where it stalls.',
    deliverable: 'Written scope, requirements and success measures',
  },
  {
    step: '02',
    title: 'UX design & prototype',
    body: 'Screens are designed and reviewed with your team before code is written, so the workflow is validated while changes are still cheap.',
    deliverable: 'Clickable prototype and design system',
  },
  {
    step: '03',
    title: 'Build in short cycles',
    body: 'You see working software every two weeks instead of waiting months for a reveal. Each cycle ends with a usable release.',
    deliverable: 'Working build, updated every two weeks',
  },
  {
    step: '04',
    title: 'Test, launch & train',
    body: 'We test across devices, migrate your data, launch on your domain and train the people who will use it day to day.',
    deliverable: 'Production launch, training and documentation',
  },
  {
    step: '05',
    title: 'Support & iterate',
    body: 'After launch we keep monitoring, fixing and improving — with a clear roadmap so new requests stay predictable.',
    deliverable: 'Support plan and prioritised roadmap',
  },
];

export const differentiators = [
  {
    title: 'Built around your process, not a template',
    body: 'We start from how your business works today. Templates are only used where they genuinely fit.',
  },
  {
    title: 'You see working software early',
    body: 'Two-week delivery cycles mean you are never months into a build before seeing anything real.',
  },
  {
    title: 'One team, end to end',
    body: 'Strategy, design, engineering, infrastructure and support sit in a single accountable team.',
  },
  {
    title: 'Your data, your systems',
    body: 'You own the code, the data and the accounts. No lock-in, no ransom, no mystery hosting.',
  },
  {
    title: 'Built to perform on mobile',
    body: 'Most of Tanzania browses on a phone. Every screen is designed and tested mobile-first.',
  },
  {
    title: 'Documentation and handover included',
    body: 'Structured documentation, admin training and a clean codebase your team can maintain.',
  },
];

export const techStack = [
  { group: 'Frontend', items: ['Astro', 'TypeScript', 'React', 'Tailwind CSS'] },
  { group: 'Backend', items: ['Node.js', 'Python', 'PHP', 'REST & GraphQL APIs'] },
  { group: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
  { group: 'Mobile', items: ['React Native', 'Flutter', 'Expo'] },
  { group: 'Infrastructure', items: ['AWS', 'Vercel', 'Docker', 'CI/CD pipelines'] },
  { group: 'Integrations', items: ['M-Pesa & Airtel Money', 'SMS gateways', 'Email & push', 'Google Workspace'] },
];

export const faqs = [
  {
    q: 'How much does a typical project cost?',
    a: 'It depends on scope, and we will not pretend otherwise. After a short discovery call we give you a written proposal with a clear price range, a breakdown by phase and what is included. You get that before committing to anything.',
  },
  {
    q: 'How long does a build take?',
    a: 'A focused business system such as POS, inventory or CRM is typically 8–16 weeks from discovery to launch. Larger platforms and multi-branch systems run longer. You see a working build every two weeks, so progress is visible throughout.',
  },
  {
    q: 'Do we own the code and the data?',
    a: 'Yes. The source code, infrastructure accounts and data are yours. We hand over the repository, documentation and credentials at launch. There is no lock-in.',
  },
  {
    q: 'Can you work with our existing systems?',
    a: 'Yes. We integrate with the accounting package, payment gateways, SMS providers and internal tools you already run, rather than asking you to replace everything.',
  },
  {
    q: 'Do you support mobile money payments?',
    a: 'Yes. M-Pesa and Airtel Money integrations are routine in our builds — collections, refunds and automated reconciliation included.',
  },
  {
    q: 'What happens after launch?',
    a: 'You get a support window, monitoring, and a prioritised roadmap for improvements. Most of our clients continue on a retainer because systems always need to evolve.',
  },
  {
    q: 'Can you sign an NDA?',
    a: 'Yes, and we expect to on most commercial projects. We are also happy to sign yours or use your template.',
  },
  {
    q: 'Do you work with clients outside Dar es Salaam?',
    a: 'Yes. We work remotely with clients across Tanzania and beyond. Discovery calls, design reviews and demos all run over video without losing quality.',
  },
];
