import { prisma } from '@/lib/prisma';

async function seed() {
  console.log('Seeding database...');

  try {
    // Clear existing plans
    await prisma.plan.deleteMany();

    // Create default plans
    const basicPlan = await prisma.plan.create({
      data: {
        name: 'Basic',
        description: 'Perfect for starting out',
        monthlyPrice: 499,
        yearlyPrice: 4990,
        trialDays: 7,
        maxWorkers: 10,
        maxRooms: 5,
        features: [
          'Worker Management',
          'Basic Attendance',
          'Room Bookings',
          'Mobile App Access',
        ],
      },
    });

    const proPlan = await prisma.plan.create({
      data: {
        name: 'Pro',
        description: 'For growing businesses',
        monthlyPrice: 999,
        yearlyPrice: 9990,
        trialDays: 14,
        maxWorkers: 50,
        maxRooms: 20,
        features: [
          'Worker Management',
          'Advanced Attendance',
          'Analytics & Reports',
          'Room Bookings',
          'Payment Integration',
          'Mobile App Access',
          'Priority Support',
        ],
      },
    });

    const enterprisePlan = await prisma.plan.create({
      data: {
        name: 'Enterprise',
        description: 'For large organizations',
        monthlyPrice: 2999,
        yearlyPrice: 29990,
        trialDays: 30,
        maxWorkers: 500,
        maxRooms: 100,
        features: [
          'Unlimited Workers',
          'Unlimited Rooms',
          'Advanced Analytics',
          'Custom Reports',
          'Payment Integration',
          'Mobile App Access',
          'API Access',
          'Dedicated Support',
          'Custom Integrations',
        ],
      },
    });

    console.log('✓ Created plans:', {
      basic: basicPlan.name,
      pro: proPlan.name,
      enterprise: enterprisePlan.name,
    });

    // Create FAQ items
    const faqs = [
      {
        category: 'General',
        question: 'What is GuestWorker?',
        answer:
          'GuestWorker is a comprehensive workforce management platform for contractors to manage workers, employers, room bookings, and payments.',
        order: 1,
      },
      {
        category: 'General',
        question: 'How do I get started?',
        answer: 'Sign up for an account, choose a plan, and start managing your workforce immediately.',
        order: 2,
      },
      {
        category: 'Billing',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major payment methods through Razorpay including credit cards, debit cards, UPI, and bank transfers.',
        order: 1,
      },
      {
        category: 'Billing',
        question: 'Can I upgrade or downgrade my plan?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
        order: 2,
      },
      {
        category: 'Technical',
        question: 'What browsers do you support?',
        answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge.',
        order: 1,
      },
      {
        category: 'Technical',
        question: 'Is my data secure?',
        answer: 'Yes, we use industry-standard encryption and security measures to protect your data.',
        order: 2,
      },
    ];

    for (const faq of faqs) {
      await prisma.fAQItem.create({ data: faq });
    }

    console.log('✓ Created FAQ items');

    // Create content pages
    const contents = [
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        type: 'legal',
        content: 'Your privacy is important to us...',
      },
      {
        slug: 'terms-of-service',
        title: 'Terms of Service',
        type: 'legal',
        content: 'By using GuestWorker, you agree to our terms...',
      },
      {
        slug: 'about-us',
        title: 'About GuestWorker',
        type: 'page',
        content: 'GuestWorker is a modern workforce management platform...',
      },
      {
        slug: 'contact',
        title: 'Contact Us',
        type: 'page',
        content: 'Get in touch with our support team...',
      },
    ];

    for (const content of contents) {
      await prisma.content.create({ data: content });
    }

    console.log('✓ Created content pages');
    console.log('✓ Database seeded successfully!');
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
