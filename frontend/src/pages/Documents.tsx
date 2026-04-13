// pages/Documents.tsx
import { useState, useEffect } from 'react';
import sortIcon from '../assets/стрелки сортировка.png';
import { getDocuments, getDocumentById, getDocumentTypes } from '../services/api';

interface DocumentsProps {
  userName?: string;
  userId?: number;
  userRole: 'admin' | 'user';
  onBack: () => void;
  onLogout: () => void;
}

interface DocumentType {
  id: number;
  name: string;
  fields_config: any[]; // массив полей { key, label, type, ... }
}

export function Documents({ userName, userId, onBack, onLogout }: DocumentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<Map<number, DocumentType>>(new Map());

  // Загрузка типов документов из БД
  const loadDocumentTypes = async () => {
    try {
      const types = await getDocumentTypes();
      const map = new Map<number, DocumentType>();
      types.forEach((type: any) => map.set(type.id, type));
      setDocumentTypes(map);
    } catch (error) {
      console.error('Ошибка загрузки типов документов:', error);
    }
  };

  const loadDocuments = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const allDocs = await getDocuments();
      const userDocs = allDocs.filter((doc: any) => doc.user_id === userId);
      const formatted = userDocs.map((doc: any) => ({
        id: doc.id,
        date: doc.created_at,
        typeId: doc.document_type_id,
        form_data: doc.form_data,
      }));
      setDocuments(formatted);
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadDocumentTypes();
      loadDocuments();
    }
  }, [userId]);

  // Получение названия типа документа по ID
  const getTypeName = (typeId: number): string => {
    return documentTypes.get(typeId)?.name || 'Документ';
  };

  // Получение конфигурации полей для типа
  const getFieldsConfig = (typeId: number): any[] => {
    return documentTypes.get(typeId)?.fields_config || [];
  };

  // Фильтрация и сортировка
  const filteredDocs = documents.filter(doc =>
    getTypeName(doc.typeId).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleOpenDocument = async (docId: number) => {
    try {
      const doc = await getDocumentById(docId);
      setSelectedDocument(doc);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка загрузки документа:', error);
    }
  };

  const handlePrint = () => {
    if (!selectedDocument) return;
    const typeId = selectedDocument.document_type_id;
    const typeName = getTypeName(typeId);
    let formData = selectedDocument.form_data;
    if (typeof formData === 'string') {
      try { formData = JSON.parse(formData); } catch(e) { formData = {}; }
    }
    const fieldsConfig = getFieldsConfig(typeId);
    const filledFields = fieldsConfig.filter(field => {
      const value = formData[field.key];
      return value !== undefined && value !== null && value !== '';
    });
    const fieldsHtml = filledFields.map(field => `
      <div class="info-row">
        <div class="info-label">${field.label}:</div>
        <div class="info-value">${field.type === 'date' ? new Date(formData[field.key]).toLocaleDateString('ru-RU') : formData[field.key]}</div>
      </div>
    `).join('');
    const printHtml = `
      <!DOCTYPE html>
      <html><head><title>${typeName}</title><meta charset="UTF-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Times New Roman',serif; padding:40px; }
        .document { max-width:800px; margin:0 auto; border:1px solid #ccc; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
        .header { text-align:center; padding:30px; border-bottom:2px solid #2860F0; }
        .header h1 { font-size:24px; text-transform:uppercase; }
        .content { padding:30px; }
        .info-row { display:flex; margin-bottom:16px; padding-bottom:12px; border-bottom:1px dashed #ccc; }
        .info-label { width:200px; font-weight:600; }
        .info-value { flex:1; }
        .stamp { margin-top:30px; display:flex; justify-content:space-between; }
        .signature-line { width:200px; border-top:1px solid #000; margin-top:5px; }
        .footer { margin-top:30px; text-align:center; font-size:11px; color:#999; }
        @media print { body { padding:0; } .document { box-shadow:none; border:none; } }
      </style>
      </head><body>
      <div class="document">
        <div class="header"><h1>${typeName}</h1><div>Документ №${selectedDocument.id}</div><div>Дата: ${formatDate(selectedDocument.created_at)}</div></div>
        <div class="content">${fieldsHtml || '<p>Нет заполненных полей</p>'}
        <div class="stamp"><div><div>М.П.</div><div class="signature-line"></div><div>Подпись отправителя</div></div>
        <div><div>М.П.</div><div class="signature-line"></div><div>Подпись перевозчика</div></div></div></div>
        <div class="footer">Система электронного документооборота "Documentob Diplom"</div>
      </div>
      <script>window.print(); window.close();<\/script>
      </body></html>
    `;
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(printHtml);
      printWin.document.close();
    } else {
      alert('Разрешите всплывающие окна для печати');
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <div className="absolute top-4 left-6 z-10">
        <button onClick={onBack} className="px-4 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg shadow-md flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Закрыть
        </button>
      </div>
      <div className="absolute top-4 right-6 z-10">
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg shadow-md">Выход</button>
      </div>

      <div className="pt-20 px-6 pb-6">
        <div className="w-full">
          <h1 className="text-2xl font-bold text-[#2860F0] mb-6">Документы пользователя: {userName || `ID: ${userId}`}</h1>

          <div className="flex gap-4 mb-6">
            <input type="text" placeholder="Поиск документов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="bg-white rounded-[20px] shadow-md">
            <div className="grid grid-cols-3 gap-4 px-6 py-3 rounded-t-[20px]" style={{ backgroundColor: '#E4E0FF', border: '1.5px solid #7C5CFC', borderBottom: 'none' }}>
              <div className="flex items-center justify-between text-[#7C5CFC] font-semibold">
                <span>Время создания</span>
                <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="ml-2">
                  <img src={sortIcon} alt="Сортировка" style={{ width: '20px', height: '15px' }} />
                </button>
              </div>
              <div className="text-[#7C5CFC] font-semibold">Тип документа</div>
              <div className="text-[#7C5CFC] font-semibold"></div>
            </div>
            <div className="divide-y divide-gray-100 rounded-b-[20px] overflow-hidden">
              {isLoading ? (
                <div className="px-6 py-8 text-center text-gray-500" style={{ backgroundColor: '#EFECF9' }}>Загрузка...</div>
              ) : userId && sortedDocs.length > 0 ? (
                sortedDocs.map(doc => (
                  <div key={doc.id} className="grid grid-cols-3 gap-4 px-6 py-3 hover:bg-gray-50 cursor-pointer" style={{ backgroundColor: '#EFECF9' }} onClick={() => handleOpenDocument(doc.id)}>
                    <div className="text-gray-700">{formatDate(doc.date)}</div>
                    <div className="text-gray-700 font-medium text-[#2860F0]">{getTypeName(doc.typeId)}</div>
                    <div className="text-gray-700">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenDocument(doc.id); }} className="text-[#2860F0] hover:underline">📄 Открыть</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500" style={{ backgroundColor: '#EFECF9' }}>Документы не найдены</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно просмотра документа */}
      {isModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="w-[800px] max-h-[90vh] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {formatDate(selectedDocument.created_at)} / {getTypeName(selectedDocument.document_type_id)}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#6990F5]">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="bg-[#C9D9FF] rounded-lg p-4">
                  <span className="text-sm text-[#434343] font-medium mb-3 block">Данные документа:</span>
                  <div className="space-y-2">
                    {(() => {
                      let formData = selectedDocument.form_data;
                      if (typeof formData === 'string') {
                        try { formData = JSON.parse(formData); } catch(e) { formData = {}; }
                      }
                      const fieldsConfig = getFieldsConfig(selectedDocument.document_type_id);
                      const filledFields = fieldsConfig.filter(f => {
                        const val = formData[f.key];
                        return val !== undefined && val !== null && val !== '';
                      });
                      if (filledFields.length === 0) return <div className="text-center text-gray-400 py-4">Нет данных</div>;
                      return filledFields.map(field => (
                        <div key={field.key} className="flex py-2 border-b border-[#C9D9FF] last:border-0">
                          <div className="w-44 font-medium text-[#434343] text-sm">{field.label}:</div>
                          <div className="flex-1 text-gray-800 text-sm break-words">
                            {field.type === 'date' ? new Date(formData[field.key]).toLocaleDateString('ru-RU') : String(formData[field.key])}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#C9D9FF] px-6 py-4 flex gap-3">
              <button onClick={handlePrint} className="flex-1 py-2 bg-[#2860F0] hover:bg-[#4475F7] text-white font-medium rounded-lg border border-white">🖨️ Печать</button>
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg border border-white">❌ Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}