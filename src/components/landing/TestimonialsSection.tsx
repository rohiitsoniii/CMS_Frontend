import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CTO at TechStart',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'This CMS has transformed how we manage content across our platforms. The API is incredibly fast and the developer experience is top-notch.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Lead Developer at Digital Agency',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    content: 'Best headless CMS I\'ve used. The visual content type builder saves us hours of development time. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager at E-commerce Co',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    content: 'The collaboration features are game-changing. Our content team can now work together seamlessly with comments and workflows.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Founder at StartupXYZ',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content: 'Switched from Contentful and never looked back. Better features at a fraction of the cost. The support team is amazing!',
    rating: 5,
  },
  {
    name: 'Lisa Anderson',
    role: 'Marketing Director',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    content: 'Finally, a CMS that non-technical team members can use easily. The interface is intuitive and the localization features are perfect for our global team.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Full Stack Developer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    content: 'The GraphQL API is incredibly powerful. Integration with our Next.js app was seamless. This is the future of content management.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by developers and content teams
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join thousands of teams who trust our platform for their content needs.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col justify-between rounded-2xl bg-gray-50 p-8 shadow-sm ring-1 ring-gray-900/5"
            >
              <div>
                <div className="flex gap-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-base leading-7 text-gray-600">
                  "{testimonial.content}"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-x-4">
                <img
                  className="h-12 w-12 rounded-full bg-gray-50"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
