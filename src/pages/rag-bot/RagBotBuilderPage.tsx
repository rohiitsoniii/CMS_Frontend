import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Book, 
  Palette, 
  Play, 
  Code, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Globe, 
  FileText, 
  Database,
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ragBotAPI } from '@/services/api';
import { RagBotBuilderSkeleton } from '@/components/skeletons';
import toast from 'react-hot-toast';

// Sub-components (could be extracted later)
import BotIdentityStep from '@/components/rag-bot/BotIdentityStep';
import KnowledgeSourcesStep from '@/components/rag-bot/KnowledgeSourcesStep';
import WidgetAppearanceStep from '@/components/rag-bot/WidgetAppearanceStep';
import LiveChatPreviewStep from '@/components/rag-bot/LiveChatPreviewStep';
import EmbedCodeStep from '@/components/rag-bot/EmbedCodeStep';

const steps = [
  { id: 'identity', name: 'Bot Persona', icon: Bot, description: 'Personality & behavior' },
  { id: 'knowledge', name: 'Knowledge', icon: Book, description: 'Train your AI' },
  { id: 'appearance', name: 'Appearance', icon: Palette, description: 'Widget design' },
  { id: 'preview', name: 'Test Chat', icon: Play, description: 'Live preview' },
  { id: 'deploy', name: 'Deployment', icon: Code, description: 'Go live' },
];

const RagBotBuilderPage: React.FC = () => {
  const { projectId, botId } = useParams<{ projectId: string; botId: string }>();
  const navigate = useNavigate();
  const isEdit = !!botId && botId !== 'new';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'draft',
    persona: {
      systemPrompt: 'You are a helpful assistant. Use the provided context to answer questions.',
      temperature: 0.7,
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      maxResponseTokens: 500,
      language: 'en',
    },
    widget: {
      name: 'AI Assistant',
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      position: 'bottom-right',
      greeting: 'Hi! How can I help you today?',
      placeholder: 'Ask me anything...',
      suggestedQuestions: [],
      showSources: true,
      collectEmail: false,
    },
    allowedOrigins: [],
    retrieval: {
      topK: 4,
      similarityThreshold: 0.2,
      reranking: false,
    }
  });

  useEffect(() => {
    if (isEdit) {
      fetchBot();
    }
  }, [botId]);

  const fetchBot = async () => {
    try {
      const response = await ragBotAPI.getById(projectId!, botId!);
      setFormData(response.data.data);
    } catch (error) {
      toast.error('Failed to load bot data');
      navigate(`/dashboard/projects/${projectId}/rag-bots`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (showToast = true) => {
    setSaving(true);
    try {
      if (isEdit) {
        await ragBotAPI.update(projectId!, botId!, formData);
        if (showToast) toast.success('Changes saved');
      } else {
        const response = await ragBotAPI.create(projectId!, formData);
        toast.success('Bot created successfully');
        navigate(`/dashboard/projects/${projectId}/rag-bots/${response.data.data._id}`);
      }
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save bot');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      // Save progress if on first few steps
      if (currentStep < 3) {
        const success = await handleSave(false);
        if (!success) return;
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return <RagBotBuilderSkeleton />;
  }

  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Step Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/dashboard/projects/${projectId}/rag-bots`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-500" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEdit ? `Editing ${formData.name}` : 'Create New RAG Bot'}
                </h1>
                <p className="text-xs text-gray-500 font-mono">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-1">
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      idx === currentStep ? 'bg-indigo-50 text-indigo-700' :
                      idx < currentStep ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === currentStep ? 'bg-indigo-600 text-white' :
                      idx < currentStep ? 'bg-green-100 text-green-600' : 'bg-gray-100'
                    }`}>
                      {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{step.name}</span>
                  </div>
                  {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg h-10 hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Step Controls (Mobile) / Sidebar (Desktop) */}
          <div className="lg:w-64 flex-shrink-0">
             <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm sticky top-28">
               {steps.map((step, idx) => {
                 const Icon = step.icon;
                 return (
                   <button
                    key={step.id}
                    onClick={() => idx <= currentStep || (isEdit && setCurrentStep(idx))}
                    disabled={!isEdit && idx > currentStep}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-1 ${
                      idx === currentStep ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' :
                      idx < currentStep ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'
                    }`}
                   >
                     <Icon className="w-5 h-5 flex-shrink-0" />
                     <div className="overflow-hidden">
                       <p className="text-sm font-bold truncate">{step.name}</p>
                       <p className={`text-[10px] truncate ${idx === currentStep ? 'text-indigo-100' : 'text-gray-400'}`}>
                         {step.description}
                       </p>
                     </div>
                   </button>
                 );
               })}
             </div>
          </div>

          {/* Active Step Page */}
          <div className="flex-grow">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px]">
              <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-indigo-600">
                    <CurrentStepIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].name}</h2>
                    <p className="text-gray-500">{steps[currentStep].description}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                 {currentStep === 0 && (
                   <BotIdentityStep 
                     formData={formData} 
                     setFormData={setFormData} 
                     projectId={projectId!} 
                   />
                 )}
                 {currentStep === 1 && (
                   <KnowledgeSourcesStep 
                     bot={formData} 
                     projectId={projectId!} 
                     botId={botId!} 
                   />
                 )}
                 {currentStep === 2 && (
                   <WidgetAppearanceStep 
                     formData={formData} 
                     setFormData={setFormData} 
                   />
                 )}
                 {currentStep === 3 && (
                   <LiveChatPreviewStep 
                     bot={formData} 
                     projectId={projectId!} 
                   />
                 )}
                 {currentStep === 4 && (
                   <EmbedCodeStep 
                     bot={formData} 
                     projectId={projectId!} 
                     botId={botId!} 
                   />
                 )}
              </div>

              {/* Step Navigation Buttons */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="inline-flex items-center px-6 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-0 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="inline-flex items-center px-8 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-0 transition-all"
                >
                  Next Step
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-gray-400 text-sm">
                <span className="flex items-center gap-1"><Info className="w-4 h-4" /> Progress is auto-saved</span>
                <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> Embeddable on any site</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RagBotBuilderPage;
