export interface Service {
  slug: string;
  name: string;
  short: string;
  blurb: string;
  outcomes: string[];
  icon: 'code' | 'mobile' | 'web' | 'automation' | 'design' | 'school' | 'pos' | 'logistics' | 'crm';
  featured?: boolean;
}

export const services: Service[] = [
  {
    slug: 'software-development-tanzania',
    name: 'Custom Software Development',
    short: 'Web, desktop and server systems built to your exact process.',
    blurb:
      'Bespoke software engineered around how your organisation actually operates — not a template bent to fit.',
    outcomes: ['Paperwork replaced with working software', 'Shorter approval cycles', 'One source of truth across departments'],
    icon: 'code',
    featured: true,
  },
  {
    slug: 'mobile-app-development-tanzania',
    name: 'Mobile App Development',
    short: 'iOS and Android apps for customers, staff and field teams.',
    blurb:
      'Native and cross-platform apps that work on the networks and devices your customers actually use.',
    outcomes: ['Customers self-serve', 'Field teams stay in sync offline', 'Payments and receipts on device'],
    icon: 'mobile',
    featured: true,
  },
  {
    slug: 'web-development-tanzania',
    name: 'Web Platforms & Portals',
    short: 'Customer portals, booking systems and booking-to-dispatch platforms.',
    blurb:
      'Fast, secure web platforms with customer logins, admin panels and integrations to your existing tools.',
    outcomes: ['24/7 self-service bookings', 'Branded domain, no third-party badge', 'Admin control without a developer'],
    icon: 'web',
    featured: true,
  },
  {
    slug: 'business-automation-tanzania',
    name: 'Business Automation',
    short: 'Replace manual spreadsheets, WhatsApp chains and paper registers.',
    blurb:
      'We map the manual steps that slow you down, then automate them end to end — including the integrations.',
    outcomes: ['Fewer data-entry errors', 'Automated reports and alerts', 'Auditable approval trails'],
    icon: 'automation',
    featured: true,
  },
  {
    slug: 'ui-ux-design-tanzania',
    name: 'UI/UX & Product Design',
    short: 'Research, interface design and design systems that users adopt.',
    blurb:
      'Designed around real user journeys in your market — tested, accessible and built on a scalable design system.',
    outcomes: ['Fewer support calls', 'Higher completion rates', 'Consistent UI across every screen'],
    icon: 'design',
  },
  {
    slug: 'school-management-system-tanzania',
    name: 'School Management System',
    short: 'Admissions, fees, results and parent communication in one place.',
    blurb:
      'Purpose-built for Tanzanian schools and institutions — fee receipts, term reporting and parent access included.',
    outcomes: ['Fee collection tracked in real time', 'Automated parent reports', 'Exam and result entry in minutes'],
    icon: 'school',
  },
  {
    slug: 'pos-inventory-management-system-tanzania',
    name: 'POS & Inventory Management',
    short: 'Point of sale, stock control and multi-branch reporting.',
    blurb:
      'Run every counter, branch and warehouse from one system — offline-tolerant and multi-user.',
    outcomes: ['Live stock across locations', 'Barcode and receipt printing', 'Margin and movement reporting'],
    icon: 'pos',
  },
  {
    slug: 'logistics-fleet-management-software-tanzania',
    name: 'Logistics & Fleet Management',
    short: 'Dispatch, tracking, drivers, fuel and vehicle maintenance.',
    blurb:
      'Control the whole movement chain — from booking to delivery, with live tracking for customers and managers.',
    outcomes: ['Live vehicle tracking', 'Fuel and maintenance cost control', 'Proof-of-delivery records'],
    icon: 'logistics',
  },
  {
    slug: 'crm-software-tanzania',
    name: 'CRM & Sales Management',
    short: 'Leads, pipeline, follow-ups and sales team accountability.',
    blurb:
      'Know exactly where every deal stands, who last spoke to the client and what happens next.',
    outcomes: ['No lost leads', 'Follow-up reminders that fire', 'Pipeline and forecast visibility'],
    icon: 'crm',
  },
];

export const featuredServices = services.filter((s) => s.featured);
