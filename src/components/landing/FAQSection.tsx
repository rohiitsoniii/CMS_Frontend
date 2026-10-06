import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is a headless CMS?',
    answer: 'A headless CMS is a content management system that separates content from presentation. It provides content via APIs (REST or GraphQL) that can be consumed by any frontend - websites, mobile apps, IoT devices, etc.',
  },
  {
    question: 'How does the free trial work?',
    answer: 'You get full access to all features for 14 days, no credit card required. After the trial, you can choose a paid plan or continue with our free tier.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! You can cancel your subscription at any time. Your data will remain accessible, and you can export it before canceling.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise customers can also pay via invoice.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade security with encryption at rest and in transit, regular backups, and SOC 2 compliance. Your data is stored in secure data centers with 99.9% uptime SLA.',
  },
  {
    question: 'Can I migrate from another CMS?',
    answer: 'Yes! We provide migration tools and support for importing content from Contentful, Sanity, Strapi, and other popular CMSs. Our team can help with the migration process.',
  },
  {
    question: 'Do you offer custom plans?',
    answer: 'Yes, we offer custom enterprise plans with dedicated infrastructure, custom SLAs, and white-label options. Contact our sales team for details.',
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'Free tier includes community support. Paid plans include email support (Starter), priority support (Professional), and 24/7 support with dedicated account manager (Business & Enterprise).',
  },
];

export function FAQSection() {
  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600 text-center">
            Have questions? We've got answers.
          </p>
          <div className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <p className="mt-10 text-center text-sm text-gray-600">
            Still have questions?{' '}
            <a href="/contact" className="font-semibold text-blue-600 hover:text-blue-500">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
