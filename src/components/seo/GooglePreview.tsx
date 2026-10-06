import React from 'react';
import { Card } from '@/components/ui/card';
import { Globe, Smartphone, Monitor } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GooglePreviewProps {
    title: string;
    description: string;
    slug: string;
    siteName?: string;
}

export function GooglePreview({
    title,
    description,
    slug,
    siteName = 'Your Website'
}: GooglePreviewProps) {
    const [device, setDevice] = React.useState<'mobile' | 'desktop'>('mobile');

    // Simulate truncation
    const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
    const displayDesc = description.length > 160 ? description.substring(0, 157) + '...' : description;
    const fullUrl = `https://example.com/${slug || ''}`;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Google Search Preview</h3>
                <Tabs value={device} onValueChange={(v) => setDevice(v as any)} className="w-[140px]">
                    <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="mobile" className="text-xs">
                            <Smartphone className="w-3 h-3 mr-1" />
                            Mobile
                        </TabsTrigger>
                        <TabsTrigger value="desktop" className="text-xs">
                            <Monitor className="w-3 h-3 mr-1" />
                            Desk
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Card className="p-4 bg-white dark:bg-gray-50 border border-gray-100 overflow-hidden">
                {device === 'mobile' ? (
                    <div className="font-sans max-w-sm">
                        {/* Mobile View */}
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                                <Globe className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-black truncate">{siteName}</span>
                                <span className="text-xs text-gray-500 truncate">{fullUrl}</span>
                            </div>
                        </div>
                        <div className="text-[#1a0dab] text-lg leading-6 font-medium cursor-pointer hover:underline mb-1">
                            {displayTitle || 'Page Title'}
                        </div>
                        <div className="text-sm text-[#4d5156] leading-5">
                            {displayDesc || 'Meta description will appear here...'}
                        </div>
                    </div>
                ) : (
                    <div className="font-sans max-w-xl">
                        {/* Desktop View */}
                        <div className="flex items-center gap-1 mb-1">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-1">
                                <Globe className="w-3 h-3 text-gray-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-black truncate">{siteName}</span>
                                <span className="text-xs text-gray-500 truncate">{fullUrl}</span>
                            </div>
                        </div>
                        <div className="text-[#1a0dab] text-xl cursor-pointer hover:underline mb-1">
                            {displayTitle || 'Page Title'}
                        </div>
                        <div className="text-sm text-[#4d5156]">
                            {displayDesc || 'Meta description will appear here...'}
                        </div>
                    </div>
                )}
            </Card>

            <p className="text-xs text-gray-400 text-center">
                This is a simulation. Actual results may vary based on Google's algorithm.
            </p>
        </div>
    );
}
