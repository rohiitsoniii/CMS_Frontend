import { 
  Zap, 
  Globe, 
  Lock, 
  Users, 
  Code, 
  Workflow,
  Database,
  Palette,
  GitBranch,
  MessageSquare,
  FileText,
  BarChart
} from 'lucide-react';

const features = [
  {
    name: 'Visual Content Type Builder',
    description: 'Create custom content models with drag-and-drop. No coding required.',
    icon: Palette,
  },
  {
    name: 'Multi-Project Management',
    description: 'Manage unlimited websites and apps from a single dashboard.',
    icon: Database,
  },
  {
    name: 'Powerful APIs',
    description: 'RESTful and GraphQL APIs for seamless integration with any frontend.',
    icon: Code,
  },
  {
    name: 'Team Collaboration',
    description: 'Invite team members, assign roles, and collaborate in real-time.',
    icon: Users,
  },
  {
    name: 'Workflow & Approvals',
    description: 'Set up approval workflows for content publishing and reviews.',
    icon: Workflow,
  },
  {
    name: 'Localization',
    description: 'Manage content in 10+ languages with built-in translation support.',
    icon: Globe,
  },
  {
    name: 'Version Control',
    description: 'Track changes, restore previous versions, and compare content.',
    icon: GitBranch,
  },
  {
    name: 'Comments & Feedback',
    description: 'Collaborate with inline comments and @mentions on content.',
    icon: MessageSquare,
  },
  {
    name: 'Media Management',
    description: 'Upload, organize, and edit images with built-in image editor.',
    icon: FileText,
  },
  {
    name: 'Analytics & Insights',
    description: 'Track content performance and API usage with detailed analytics.',
    icon: BarChart,
  },
  {
    name: 'Enterprise Security',
    description: 'RBAC, field-level permissions, audit logs, and 2FA support.',
    icon: Lock,
  },
  {
    name: 'Lightning Fast',
    description: 'Built for speed with Redis caching and CDN integration.',
    icon: Zap,
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Everything you need
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            All-in-one Headless CMS Platform
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Powerful features that help you build, manage, and scale your digital experiences.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
