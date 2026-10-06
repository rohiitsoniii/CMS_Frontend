import { Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  { name: 'Visual Content Type Builder', us: true, contentful: true, sanity: true, strapi: true },
  { name: 'GraphQL API', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'REST API', us: true, contentful: true, sanity: true, strapi: true },
  { name: 'Team Collaboration', us: true, contentful: true, sanity: true, strapi: true },
  { name: 'Workflows & Approvals', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Version Control', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Localization', us: true, contentful: true, sanity: true, strapi: true },
  { name: 'Media Management', us: true, contentful: true, sanity: true, strapi: true },
  { name: 'Image Editing', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Comments & Collaboration', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Audit Logs', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Webhooks', us: true, contentful: true, sanity: true, strapi: true },
  { name: 'Content Scheduling', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Live Preview', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Plugin System', us: true, contentful: true, sanity: true, strapi: true },
  { name: 'Field-Level Permissions', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Bulk Operations', us: true, contentful: true, sanity: true, strapi: true },
  { name: 'Content Duplication', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Trash/Recycle Bin', us: true, contentful: true, sanity: true, strapi: false },
  { name: 'Archive System', us: true, contentful: true, sanity: false, strapi: false },
  { name: 'Self-Hosted Option', us: true, contentful: false, sanity: false, strapi: true },
  { name: 'Open Source', us: true, contentful: false, sanity: false, strapi: true },
];

const pricing = [
  { plan: 'Free', us: '$0', contentful: '$0', sanity: '$0', strapi: '$0' },
  { plan: 'Starter', us: '$29', contentful: '$489', sanity: '$199', strapi: '$99' },
  { plan: 'Professional', us: '$99', contentful: '$879', sanity: '$499', strapi: '$499' },
  { plan: 'Enterprise', us: '$999', contentful: '$2,000+', sanity: '$2,000+', strapi: 'Custom' },
];

export function ComparisonPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            How We Compare
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            See how we stack up against other popular headless CMS platforms.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Feature Comparison</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider">
                      Us
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contentful
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sanity
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Strapi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {features.map((feature) => (
                    <tr key={feature.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feature.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.us ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.contentful ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.sanity ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.strapi ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Pricing Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Pricing Comparison</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider">
                      Us
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contentful
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sanity
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Strapi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pricing.map((row) => (
                    <tr key={row.plan}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                        {row.us}/mo
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {row.contentful}/mo
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {row.sanity}/mo
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {row.strapi}/mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="mt-4 text-center text-sm text-gray-600">
            💰 Save up to <span className="font-bold text-green-600">70%</span> compared to Contentful!
          </p>
        </div>

        {/* Key Advantages */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Better Value</h3>
              <p className="text-gray-600">
                Get all the features of enterprise CMSs at a fraction of the cost. Save thousands per year.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">More Features</h3>
              <p className="text-gray-600">
                We have features that competitors charge extra for or don't offer at all.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Control</h3>
              <p className="text-gray-600">
                Self-hosted option available. Your data, your infrastructure, your rules.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
