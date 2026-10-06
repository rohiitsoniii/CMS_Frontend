import React from 'react';
import { Bot, User, MessageSquare, Terminal, Smile, Info } from 'lucide-react';

interface BotIdentityStepProps {
  formData: any;
  setFormData: (data: any) => void;
  projectId: string;
}

const BotIdentityStep: React.FC<BotIdentityStepProps> = ({ formData, setFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: child === 'temperature' ? parseFloat(value) : value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Bot Identity */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          Basic Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
               Bot Name
               <span className="text-red-500 text-xs">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smile className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme Support Bot"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400">Public name seen by users in the widget.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
               Bot Slug / URL ID
               <span className="text-red-500 text-xs">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs font-mono">/</span>
              </div>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="my-cool-bot"
                className="block w-full pl-6 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                required
              />
            </div>
             <p className="text-[10px] text-gray-400">Unique identifier used for API and embed script.</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Internal Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What is the purpose of this bot?"
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[80px]"
          />
        </div>
      </section>

      {/* AI Persona */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
          <Terminal className="w-5 h-5 text-indigo-600" />
          AI Persona & Instructions
        </h3>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
            System Instructions (The Prompt)
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Required context will be auto-appended</span>
          </label>
          <textarea
            name="persona.systemPrompt"
            value={formData.persona.systemPrompt}
            onChange={handleChange}
            rows={6}
            className="block w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm bg-gray-50/50"
            placeholder="You are a helpful assistant for Acme Corp..."
          />
          <div className="p-3 bg-amber-50 rounded-xl flex gap-3">
             <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
             <p className="text-xs text-amber-800 leading-relaxed">
               <strong>Tip:</strong> Be specific about the bot's tone and role. Example: "You are a professional support agent for Acme. Always be polite and refer to the context for pricing information."
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">AI Model</label>
            <select
              name="persona.model"
              value={formData.persona.model}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (Free, Fast)</option>
              <option value="meta-llama/llama-3.2-1b-instruct:free">Llama 3.2 1B (Light, Ultra Fast)</option>
              <option value="google/gemma-2-9b-it:free">Gemma 2 9B (Free, Intelligent)</option>
              <option value="microsoft/phi-3-mini-128k-instruct:free">Phi-3 Mini (Large context)</option>
            </select>
          </div>
          <div className="space-y-2">
             <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
               Creativity (Temp)
               <span className="text-indigo-600 font-bold">{formData.persona.temperature}</span>
             </label>
             <input
               type="range"
               name="persona.temperature"
               min="0"
               max="1"
               step="0.1"
               value={formData.persona.temperature}
               onChange={handleChange}
               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
             <div className="flex justify-between text-[10px] text-gray-400 px-1">
               <span>Focused</span>
               <span>Creative</span>
             </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Language</label>
            <select
              name="persona.language"
              value={formData.persona.language}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
               <option value="en">English</option>
               <option value="es">Spanish</option>
               <option value="fr">French</option>
               <option value="de">German</option>
               <option value="auto">Auto-detect</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BotIdentityStep;
