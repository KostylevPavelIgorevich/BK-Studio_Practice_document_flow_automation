// pages/WaybillNewPage.tsx - полный файл с правильными стилями
import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { WaybillForm } from './WaybillForm';
import { getWaybillsFromTemplates, getDocuments } from '../services/api';

interface WaybillNewPageProps {
  onBack: () => void;
  onLogout: () => void;
  userId: number;
  fromApplication?: boolean;
  userName?: string;
  initialWaybillData?: {
    template: any;
    formData: Record<string, any>;
    option: string;
    waybillType: string;
  };
}

interface Template {
  filename: string;
  name: string;
  type: string;
  fields: any[];
  html_content: string;
}

interface Application {
  id: number;
  created_at: string;
  form_data: any;
  document_type: any;
}

export function WaybillNewPage({ 
  onBack, 
  onLogout, 
  userId, 
  fromApplication = false, 
  userName,
  initialWaybillData
}: WaybillNewPageProps) {
  const [option, setOption] = useState(initialWaybillData?.option || '');
  const [waybillType, setWaybillType] = useState(initialWaybillData?.waybillType || '');
  const [selectedFormType, setSelectedFormType] = useState<string>('wagon');
  const [showModal, setShowModal] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [waybillTemplates, setWaybillTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [initialFormData, setInitialFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const optionOptions = [
    { value: 'gu12', label: 'По заявке на перевозку грузов ГУ-12' },
    { value: 'gu13', label: 'По распоряжению о внутрихозяйственных перевозках ГУ-13' },
  ];
  
  const typeOptions = [
    { value: '90', label: '90 - Универсальный перевозочный документ' },
    { value: '94', label: '94 - Универсальный перевозочный документ' },
  ];

  const formTypeOptions = [
    { value: 'wagon', label: 'Повагонная' },
    { value: 'group', label: 'Групповая' },
    { value: 'container', label: 'Контейнерная' },
    { value: 'container_set', label: 'Контейнерная комплектом' },
  ];

  useEffect(() => {
    loadWaybillTemplates();
  }, []);

  const loadWaybillTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getWaybillsFromTemplates();
      if (response && response.success) {
        const waybillsData = response.waybills || [];
        setWaybillTemplates(waybillsData);
        if (waybillsData.length > 0) {
          setSelectedTemplate(waybillsData[0]);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fromApplication && option) {
      loadApplications();
    }
  }, [option]);

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const allDocs = await getDocuments();
      const userDocs = allDocs.filter((doc: any) => doc.user_id === userId);
      
      // Фильтруем заявки по типу ГУ-12 (id=1) или ГУ-13 (id=2)
      const filtered = userDocs.filter((doc: any) => {
        if (option === 'gu12' && doc.document_type_id === 1) return true;
        if (option === 'gu13' && doc.document_type_id === 2) return true;
        return false;
      });
      
      setApplications(filtered);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  const getFormTypeFromFilename = (filename: string): string => {
    if (filename.includes('container_set')) return 'container_set';
    if (filename.includes('container')) return 'container';
    if (filename.includes('group')) return 'group';
    return 'wagon';
  };

  const handleOptionChangeForApplication = (value: string) => {
    setOption(value);
    setShowModal(true);
  };

  const handleModalAccept = () => {
    if (!selectedApplication) {
      alert('Выберите заявку');
      return;
    }
    
    let formData = selectedApplication.form_data;
    if (typeof formData === 'string') {
      try {
        formData = JSON.parse(formData);
      } catch (e) {
        formData = {};
      }
    }
    
    const defaultTemplate = waybillTemplates.find(t => t.filename.includes('wagon'));
    if (defaultTemplate) {
      setSelectedTemplate(defaultTemplate);
      setSelectedFormType(getFormTypeFromFilename(defaultTemplate.filename));
    }
    
    setInitialFormData(formData);
    setShowModal(false);
    setShowForm(true);
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setOption('');
    setSelectedApplication(null);
  };

  const handleContinueFromDashboard = () => {
    if (!option) {
      alert('Выберите вариант оформления');
      return;
    }
    if (!waybillType) {
      alert('Выберите тип накладной');
      return;
    }
    if (!selectedFormType) {
      alert('Выберите форму накладной');
      return;
    }
    
    const template = waybillTemplates.find(t => 
      (selectedFormType === 'wagon' && t.filename.includes('wagon')) ||
      (selectedFormType === 'group' && t.filename.includes('group')) ||
      (selectedFormType === 'container' && t.filename.includes('container') && !t.filename.includes('container_set')) ||
      (selectedFormType === 'container_set' && t.filename.includes('container_set'))
    );
    
    if (template) {
      setSelectedTemplate(template);
      setSelectedFormType(getFormTypeFromFilename(template.filename));
    }
    
    setShowForm(true);
  };

  const handleContinueFromApplication = () => {
    if (!option) {
      alert('Выберите вариант оформления');
      return;
    }
    if (!waybillType) {
      alert('Выберите тип накладной');
      return;
    }
    // Модальное окно уже открыто через handleOptionChangeForApplication
  };

  if (showForm && selectedTemplate) {
    return (
      <WaybillForm
        onBack={() => setShowForm(false)}
        onLogout={onLogout}
        userId={userId}
        option={option}
        type={waybillType}
        form={selectedFormType}
        fieldsConfig={selectedTemplate.fields}
        htmlTemplate={selectedTemplate.html_content}
        initialData={initialFormData}
        userName={userName}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4E9F8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2860F0] mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar hideMinimize={true} userName={userName} title="Оформление железнодорожной накладной" />
      
      <div className="absolute top-4 right-6 z-10 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 bg-[#3ABC96] hover:bg-[#1e4bc2] text-white font-medium rounded-lg shadow-md flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          В начало
        </button>
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg shadow-md">Выход</button>
      </div>

      <div className="pt-20 px-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Сведения о перевозочном документе</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вариант оформления <span className="text-red-500">*</span>
              </label>
              <select
                value={option}
                onChange={(e) => {
                  if (fromApplication) {
                    handleOptionChangeForApplication(e.target.value);
                  } else {
                    setOption(e.target.value);
                  }
                }}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
              >
                <option value="">Выберите вариант</option>
                {optionOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип накладной <span className="text-red-500">*</span>
              </label>
              <select
                value={waybillType}
                onChange={(e) => setWaybillType(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
              >
                <option value="">Выберите тип</option>
                {typeOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            
            {!fromApplication && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Форма накладной <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedFormType}
                  onChange={(e) => setSelectedFormType(e.target.value)}
                  className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
                >
                  <option value="">Выберите форму</option>
                  {formTypeOptions.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={fromApplication ? handleContinueFromApplication : handleContinueFromDashboard}
              disabled={!option || !waybillType || (!fromApplication && !selectedFormType)}
              className="px-6 py-2 bg-[#4475F7] hover:bg-[#3662d9] disabled:bg-gray-400 text-white font-medium rounded-lg"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно для выбора заявки */}
      {showModal && fromApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] rounded-2xl shadow-xl p-6" style={{ backgroundColor: '#6990F5', border: '1px solid #C9D9FF' }}>
            <div className="-mt-6 -mx-6 mb-4 px-6 py-3 rounded-t-2xl" style={{ backgroundColor: '#C9D9FF' }}>
              <h3 className="text-lg font-semibold text-center" style={{ color: '#2860F0' }}>Выбор заявки</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Сохранённые заявки <span className="text-red-300">*</span>
                </label>
                {loadingApps ? (
                  <p className="text-gray-200">Загрузка...</p>
                ) : applications.length === 0 ? (
                  <div className="text-center p-4 bg-yellow-100 rounded-lg text-yellow-800">
                    <p>Нет заявок данного типа.</p>
                    <p className="text-sm mt-2">Сначала создайте заявку ГУ-12 или ГУ-13.</p>
                  </div>
                ) : (
                  <select
                    value={selectedApplication?.id || ''}
                    onChange={(e) => {
                      const app = applications.find(a => a.id === Number(e.target.value));
                      setSelectedApplication(app || null);
                    }}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none"
                    style={{ backgroundColor: '#C9D9FF', border: '1.5px solid #FFFEFE', color: '#000' }}
                  >
                    <option value="">Выберите заявку</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        №{app.id} – {new Date(app.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={handleModalAccept} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg border border-white">Принять</button>
              <button onClick={handleModalCancel} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg border border-white">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}