import React from 'react';
import { 
  Type, 
  MessageSquare, 
  Palette, 
  Layout, 
  HelpCircle, 
  Plus, 
  Trash2,
  MousePointer2,
  Image as ImageIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface WidgetAppearanceStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const WidgetAppearanceStep: React.FC<WidgetAppearanceStepProps> = ({ formData, setFormData }) => {
  const updateWidget = (updates: any) => {
    setFormData({
      ...formData,
      widget: { ...formData.widget, ...updates }
    });
  };

  const handleAddQuestion = () => {
    const questions = [...(formData.widget.suggestedQuestions || []), ''];
    updateWidget({ suggestedQuestions: questions });
  };

  const handleUpdateQuestion = (idx: number, val: string) => {
    const questions = [...formData.widget.suggestedQuestions];
    questions[idx] = val;
    updateWidget({ suggestedQuestions: questions });
  };

  const handleRemoveQuestion = (idx: number) => {
    const questions = formData.widget.suggestedQuestions.filter((_: any, i: number) => i !== idx);
    updateWidget({ suggestedQuestions: questions });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Settings Panel */}
        <div className="space-y-8">
          
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
               <Type className="w-4 h-4" /> Basic Branding
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Widget Display Name</Label>
                <Input 
                  value={formData.widget.name} 
                  onChange={(e) => updateWidget({ name: e.target.value })}
                  placeholder="e.g. Acme Support Bot"
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.widget.avatarUrl || ''} 
                    onChange={(e) => updateWidget({ avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.png"
                  />
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    {formData.widget.avatarUrl ? (
                      <img src={formData.widget.avatarUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
               <Palette className="w-4 h-4" /> Color Palette
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Primary Color</Label>
                 <div className="flex gap-2">
                   <input 
                    type="color" 
                    value={formData.widget.primaryColor} 
                    onChange={(e) => updateWidget({ primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none"
                   />
                   <Input 
                    value={formData.widget.primaryColor} 
                    onChange={(e) => updateWidget({ primaryColor: e.target.value })}
                    className="font-mono text-xs"
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label>Secondary Color</Label>
                 <div className="flex gap-2">
                   <input 
                    type="color" 
                    value={formData.widget.secondaryColor} 
                    onChange={(e) => updateWidget({ secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none"
                   />
                   <Input 
                    value={formData.widget.secondaryColor} 
                    onChange={(e) => updateWidget({ secondaryColor: e.target.value })}
                    className="font-mono text-xs"
                   />
                 </div>
               </div>
            </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
               <MessageSquare className="w-4 h-4" /> Messaging
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Greeting Message</Label>
                <Textarea 
                  value={formData.widget.greeting} 
                  onChange={(e) => updateWidget({ greeting: e.target.value })}
                  placeholder="The first message the user sees"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Input Placeholder</Label>
                <Input 
                  value={formData.widget.placeholder} 
                  onChange={(e) => updateWidget({ placeholder: e.target.value })}
                  placeholder="e.g. Ask me anything..."
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Suggested Questions
                </h3>
                <Button variant="ghost" size="sm" onClick={handleAddQuestion} className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
             </div>
             <div className="space-y-2">
                {formData.widget.suggestedQuestions?.map((q: string, idx: number) => (
                  <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Input 
                      value={q} 
                      onChange={(e) => handleUpdateQuestion(idx, e.target.value)} 
                      placeholder="e.g. How do I upgrade?"
                      className="text-sm"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(idx)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(formData.widget.suggestedQuestions || []).length === 0 && (
                  <p className="text-xs text-gray-400 italic">No suggested questions added. Users will only see the input box.</p>
                )}
             </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-100">
             <div className="flex items-center justify-between">
                <div>
                   <Label className="text-sm font-bold">Show Citations</Label>
                   <p className="text-[10px] text-gray-500">Show users which files/URLs were used to answer</p>
                </div>
                <Switch 
                  checked={formData.widget.showSources} 
                  onCheckedChange={(checked) => updateWidget({ showSources: checked })} 
                />
             </div>
             <div className="flex items-center justify-between">
                <div>
                   <Label className="text-sm font-bold">Collect Emails</Label>
                   <p className="text-[10px] text-gray-500">Ask for visitor email before starting chat</p>
                </div>
                <Switch 
                  checked={formData.widget.collectEmail} 
                  onCheckedChange={(checked) => updateWidget({ collectEmail: checked })} 
                />
             </div>
          </section>

        </div>

        {/* Real-time Preview */}
        <div className="hidden lg:block">
           <div className="sticky top-28 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 px-2">
                <Layout className="w-4 h-4" /> Visual Preview
              </h3>
              
              <div className="bg-gray-100 rounded-[40px] p-8 aspect-[4/5] relative border-8 border-white shadow-2xl overflow-hidden">
                 
                 {/* The Fake Widget UI */}
                 <div className="absolute inset-0 flex flex-col bg-white">
                    {/* Fake Header */}
                    <div 
                      className="p-5 flex items-center gap-3 text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${formData.widget.primaryColor}, ${formData.widget.secondaryColor})` }}
                    >
                       <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                          {formData.widget.avatarUrl ? (
                            <img src={formData.widget.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            formData.widget.name?.charAt(0) || 'A'
                          )}
                       </div>
                       <div>
                          <p className="font-bold text-sm leading-tight">{formData.widget.name || 'AI Assistant'}</p>
                          <p className="text-[10px] opacity-80 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Always active
                          </p>
                       </div>
                    </div>

                    {/* Fake body */}
                    <div className="flex-1 p-6 space-y-6 overflow-hidden">
                       <div className="flex gap-3">
                          <div className={cn("w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-xs")} style={{ backgroundColor: formData.widget.primaryColor }}>
                             {formData.widget.name?.charAt(0) || 'A'}
                          </div>
                          <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 text-xs text-gray-700 shadow-sm">
                             {formData.widget.greeting || 'Hi! How can I help you?'}
                          </div>
                       </div>
                       
                       {formData.widget.suggestedQuestions?.length > 0 && (
                         <div className="space-y-2 pl-11">
                            {formData.widget.suggestedQuestions.slice(0, 2).map((q: string, i: number) => (
                              <div key={i} className="inline-block px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-bold">
                                {q || 'Suggested Question...'}
                              </div>
                            ))}
                         </div>
                       )}

                       <div className="flex flex-row-reverse gap-3">
                          <div className="w-8 h-8 rounded-xl flex-shrink-0 bg-gray-200" />
                          <div className="bg-indigo-600 rounded-2xl rounded-tr-none p-4 text-xs text-white shadow-md shadow-indigo-100" style={{ backgroundColor: formData.widget.primaryColor }}>
                             I have a question about your pricing plans?
                          </div>
                       </div>
                    </div>

                    {/* Fake Input */}
                    <div className="p-4 border-t border-gray-100">
                       <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                          <span className="text-xs text-gray-400">{formData.widget.placeholder || 'Ask me anything...'}</span>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: formData.widget.primaryColor }}>
                             <MousePointer2 className="w-4 h-4 fill-current" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center">Full interaction available in the "Test Chat" step.</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default WidgetAppearanceStep;
