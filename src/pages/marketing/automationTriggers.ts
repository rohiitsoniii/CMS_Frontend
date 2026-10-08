import { UserPlus, Tag, ClipboardList, Newspaper } from 'lucide-react';

export const TRIGGERS = {
    subscribed: { label: 'Someone subscribes', icon: UserPlus, hint: 'Welcome series for new contacts from forms, the chatbot or signup forms.' },
    tag_added: { label: 'A tag is added', icon: Tag, hint: 'Follow up when a contact gets a tag, e.g. "customer" or "webinar".' },
    form_submitted: { label: 'A form is submitted', icon: ClipboardList, hint: 'Nurture leads who filled in a specific form.' },
    content_published: { label: 'New content is published', icon: Newspaper, hint: 'Send (or draft) a newsletter whenever you publish a post.' },
} as const;
