// pages/WaybillNewPage.tsx
import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { getTemplatesList, getDocumentTypes, getDocuments } from '../services/api';

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

interface WaybillTemplate {
  id: number;
  filename: string;
  name: string;
  html_content: string;
}

export function WaybillNewPage({
  onBack,
  onLogout,
  userId,
  fromApplication = false,
  userName,
  initialWaybillData,
}: WaybillNewPageProps) {
  const savedApplicationData = initialWaybillData?.formData || null;
  const savedApplicationName = initialWaybillData?.template?.name || '';

  const [waybillTemplates, setWaybillTemplates] = useState<WaybillTemplate[]>([]);
  const [selectedWaybillTemplate, setSelectedWaybillTemplate] = useState<WaybillTemplate | null>(null);
  const [waybillType, setWaybillType] = useState(initialWaybillData?.waybillType || '');
  const [waybillForm, setWaybillForm] = useState(''); // ← для формы накладной (с дашборда)
  const [showModal, setShowModal] = useState(false);
  const [savedApplications, setSavedApplications] = useState<any[]>([]);
  const [selectedSavedApplication, setSelectedSavedApplication] = useState<any | null>(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const typeOptions = [
    { value: '90', label: '90 - Универсальный перевозочный документ' },
    { value: '94', label: '94 - Универсальный перевозочный документ' },
  ];

  // Опции для формы накладной (только для дашборда)
  const formTypeOptions = [
    { value: 'wagon', label: 'Повагонная' },
    { value: 'group', label: 'Групповая' },
    { value: 'container', label: 'Контейнерная' },
    { value: 'container_set', label: 'Контейнерная комплектом' },
  ];

  useEffect(() => {
    loadWaybillTemplatesForStyle();
  }, []);

  const loadWaybillTemplatesForStyle = async () => {
    setIsLoading(true);
    try {
      const files = await getTemplatesList();
      const dbTypes = await getDocumentTypes();
      const typeMap = new Map<string, number>();
      dbTypes.forEach((t: any) => {
        if (t.html_template) typeMap.set(t.html_template, t.id);
      });

      const waybills: WaybillTemplate[] = [];

      for (const item of files) {
        const filename = String(item);
        if (!filename) continue;
        
        const res = await fetch(`/templates/${filename}`);
        if (!res.ok) continue;
        const html = await res.text();
        
        const isWaybill = filename.toLowerCase().includes('waybill') || html.toLowerCase().includes('накладная');
        if (!isWaybill) continue;

        const docName = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
                        html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1] ||
                        filename.replace('.html', '').replace(/_/g, ' ');

        waybills.push({
          id: typeMap.get(filename) || 0,
          filename: filename,
          name: docName,
          html_content: html,
        });
      }

      setWaybillTemplates(waybills);
      if (waybills.length > 0 && !selectedWaybillTemplate) {
        setSelectedWaybillTemplate(waybills[0]);
      }
    } catch (err) {
      console.error('Ошибка загрузки накладных:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedApplications = async () => {
    setLoadingApps(true);
    try {
      const allDocs = await getDocuments();
      const userDocs = allDocs.filter((doc: any) => doc.user_id === userId);
      setSavedApplications(userDocs);
    } catch (error) {
      console.error('Ошибка загрузки сохранённых заявок:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleContinue = () => {
    if (!selectedWaybillTemplate) {
      alert('Выберите вариант оформления (накладную для стиля)');
      return;
    }
    if (!waybillType) {
      alert('Выберите тип накладной');
      return;
    }
    // Только если НЕ из заявки – проверяем форму накладной
    if (!fromApplication && !waybillForm) {
      alert('Выберите форму накладной');
      return;
    }
    loadSavedApplications();
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (!selectedWaybillTemplate) {
      alert('Ошибка: не выбран вариант оформления');
      return;
    }
    
    let sourceData = null;
    let sourceName = '';
    
    if (fromApplication && savedApplicationData) {
      sourceData = savedApplicationData;
      sourceName = savedApplicationName;
    } else if (selectedSavedApplication) {
      let formData = selectedSavedApplication.form_data;
      if (typeof formData === 'string') {
        try { formData = JSON.parse(formData); } catch { formData = {}; }
      }
      sourceData = formData;
      sourceName = selectedSavedApplication.form_data?.document_type_name || 'Заявка';
    } else if (fromApplication) {
      sourceData = {};
      sourceName = savedApplicationName || 'Заявка';
    } else {
      alert('Выберите сохранённую заявку (откуда взять данные)');
      return;
    }
    
    // Передаём параметры
    const params = new URLSearchParams();
    params.set('waybillFile', selectedWaybillTemplate.filename);
    params.set('waybillType', waybillType);
    params.set('sourceData', JSON.stringify(sourceData));
    params.set('sourceName', sourceName);
    
    // Если выбрана форма накладной (с дашборда) – передаём
    if (!fromApplication && waybillForm) {
      params.set('waybillForm', waybillForm);
    }
    
    window.location.href = `/waybill-form-auto?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4E9F8] flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar hideMinimize userName={userName} title="Оформление железнодорожной накладной" />

      <div className="absolute top-4 right-6 z-10 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 bg-[#3ABC96] hover:bg-[#1e4bc2] text-white rounded-lg shadow-md">
          В начало
        </button>
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg shadow-md">
          Выход
        </button>
      </div>

      <div className="pt-20 px-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Сведения о перевозочном документе</h2>

          <div className="space-y-4">
            {/* Поле 1: Вариант оформления (всегда) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вариант оформления <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWaybillTemplate?.filename || ''}
                onChange={(e) => {
                  const waybill = waybillTemplates.find(w => w.filename === e.target.value);
                  setSelectedWaybillTemplate(waybill || null);
                }}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg"
              >
                <option value="">Выберите накладную (отсюда возьмётся оформление)</option>
                {waybillTemplates.map(waybill => (
                  <option key={waybill.filename} value={waybill.filename}>{waybill.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Отсюда будет взято оформление документа (стили, верстка)</p>
            </div>

            {/* Поле 2: Тип накладной (всегда) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип накладной <span className="text-red-500">*</span>
              </label>
              <select
                value={waybillType}
                onChange={(e) => setWaybillType(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg"
              >
                <option value="">Выберите тип</option>
                {typeOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Поле 3: Форма накладной (ТОЛЬКО если НЕ из заявки) */}
            {!fromApplication && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Форма накладной <span className="text-red-500">*</span>
                </label>
                <select
                  value={waybillForm}
                  onChange={(e) => setWaybillForm(e.target.value)}
                  className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg"
                >
                  <option value="">Выберите форму</option>
                  {formTypeOptions.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Выберите тип отправки груза</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedWaybillTemplate || !waybillType || (!fromApplication && !waybillForm)}
              className="px-6 py-2 bg-[#4475F7] hover:bg-[#3662d9] disabled:bg-gray-400 text-white rounded-lg"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно выбора сохранённой заявки */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] bg-[#6990F5] rounded-lg p-6 border border-white">
            <h3 className="text-lg font-semibold text-white text-center mb-4">Выбор источника данных</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Сохранённые заявки {!fromApplication && <span className="text-red-300">*</span>}
                </label>
                {loadingApps ? (
                  <p className="text-gray-200">Загрузка...</p>
                ) : savedApplications.length === 0 ? (
                  <div className="text-center p-4 bg-yellow-100 rounded-lg text-yellow-800">
                    <p>Нет сохранённых заявок.</p>
                    {fromApplication && <p className="text-sm mt-2">Будут использованы данные текущей заявки</p>}
                    {!fromApplication && <p className="text-sm mt-2">Сначала создайте заявку</p>}
                  </div>
                ) : (
                  <select
                    value={selectedSavedApplication?.id || ''}
                    onChange={(e) => {
                      const app = savedApplications.find(a => a.id === Number(e.target.value));
                      setSelectedSavedApplication(app || null);
                    }}
                    className="w-full px-4 py-2 bg-[#C9D9FF] rounded-lg text-gray-900"
                  >
                    <option value="">Выберите заявку</option>
                    {savedApplications.map(app => (
                      <option key={app.id} value={app.id}>
                        №{app.id} – {new Date(app.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-white mt-1">
                  {fromApplication 
                    ? "Если не выбрано – будут использованы данные текущей заявки"
                    : "Отсюда будут взяты заполненные данные для накладной"
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 bg-[#3ABC96] text-white rounded-lg border border-white"
              >
                Принять и продолжить
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-[#E36756] text-white rounded-lg border border-white"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}