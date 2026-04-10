import { useState, useEffect } from 'react';
import sortIcon from '../assets/стрелки сортировка.png';
import { getDocuments, getDocumentById, printDocument as apiPrintDocument } from '../services/api';

interface DocumentsProps {
  userName?: string;
  userId?: number;
  userRole: 'admin' | 'user';
  onBack: () => void;
  onLogout: () => void;
}

// Функция для получения названия типа документа по ID (дополнена накладными)
const getDocumentTypeName = (typeId: number): string => {
  const types: Record<number, string> = {
    1: 'Заявка на перевозку грузов ГУ-12',
    2: 'Требование на перемещение порожнего вагона ГУ-27',
    3: 'Уведомление о передаче вагонов ГУ-2б',
    4: 'Уведомление о прибытии ГУ-36',
    5: 'Ярлык на прием багажа ЛУ-59',
    6: 'Накладная на перевозку груза (базовая)',
    7: 'Накладная на перевозку груза (повагонная)',
    8: 'Накладная на перевозку груза (групповая)',
    9: 'Накладная на перевозку груза (контейнерная)',
    10: 'Накладная на перевозку груза (контейнерная комплектом)',
  };
  return types[typeId] || 'Документ';
};

export function Documents({ userName, userId, userRole, onBack, onLogout }: DocumentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isOtherFormsModalOpen, setIsOtherFormsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ id: number; type: string; date: string; form_data?: any; document_type?: any } | null>(null);
  const [selectedOtherForm, setSelectedOtherForm] = useState<string | null>(null);
  const [selectedFormData, setSelectedFormData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка документов из БД при монтировании или изменении userId
  useEffect(() => {
    if (userId) {
      loadDocuments();
    }
  }, [userId]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      console.log('=== ЗАГРУЗКА ДОКУМЕНТОВ ===');
      console.log('userId для фильтрации:', userId);
      
      const allDocs = await getDocuments();
      console.log('Все документы из БД:', allDocs);
      
      if (!allDocs || allDocs.length === 0) {
        console.log('Нет документов');
        setDocuments([]);
        return;
      }
      
      // Фильтруем по user_id
      const userDocs = allDocs.filter((doc: any) => doc.user_id === userId);
      
      console.log(`Найдено ${userDocs.length} документов для user_id=${userId}`);
      
      // Форматируем для отображения с правильным типом документа
      const formattedDocs = userDocs.map((doc: any) => {
        // Получаем название типа документа
        let docType = 'Документ';
        
        if (doc.document_type && doc.document_type.name) {
          docType = doc.document_type.name;
        } else if (doc.document_type_id) {
          docType = getDocumentTypeName(doc.document_type_id);
        }
        
        console.log(`Документ ${doc.id}: document_type_id=${doc.document_type_id}, тип="${docType}"`);
        
        return {
          id: doc.id,
          date: doc.created_at,
          type: docType,
          printForms: docType,
          form_data: doc.form_data,
          document_type_id: doc.document_type_id,
          document_type: doc.document_type
        };
      });
      
      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация документов по поиску
  const filteredDocuments = documents.filter(doc =>
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Сортировка документов по дате
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (sortOrder === 'desc') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  // Форматирование даты
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Переключение сортировки
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  // Открытие модального окна документа
  const handleOpenDocument = async (docId: number) => {
    try {
      const doc = await getDocumentById(docId);
      setSelectedDocument({
        id: doc.id,
        type: doc.document_type?.name || getDocumentTypeName(doc.document_type_id),
        date: doc.created_at || new Date().toISOString(),
        form_data: doc.form_data,
        document_type: doc.document_type
      });
      setIsApplicationModalOpen(true);
    } catch (error) {
      console.error('Ошибка загрузки документа:', error);
    }
  };

  // Открытие печатной формы - ИСПРАВЛЕННАЯ ВЕРСИЯ
 const handleOpenPrintForm = async () => {
  if (!selectedDocument) return;
  
  try {
    let docData = selectedDocument;
    
    if (selectedDocument.id) {
      try {
        const freshDoc = await getDocumentById(selectedDocument.id);
        docData = {
          id: freshDoc.id,
          type: freshDoc.document_type?.name || getDocumentTypeName(freshDoc.document_type_id),
          date: freshDoc.created_at,
          form_data: freshDoc.form_data,
          document_type: freshDoc.document_type
        };
      } catch(e) {
        console.error('Ошибка получения свежих данных:', e);
      }
    }
    
    let formData = docData.form_data;
    if (typeof formData === 'string') {
      try {
        formData = JSON.parse(formData);
      } catch (e) {
        formData = {};
      }
    }
    
    // Русские названия полей (включая все поля накладных)
    const fieldLabels: Record<string, string> = {
      // ГУ-27
      'document_number': 'Номер документа',
      'wagon_number': 'Номер вагона',
      'wagon_type': 'Род вагона',
      'load_capacity': 'Грузоподъемность (тонн)',
      'departure_station': 'Станция отправления',
      'arrival_station': 'Станция прибытия',
      'distance': 'Расстояние (км)',
      // ГУ-12
      'transporting_company': 'Перевозчик',
      'app_coord_date': 'Дата согласования заявки',
      'reg_date': 'Дата регистрации заявки',
      'bid_number': 'Номер заявки',
      'start_date': 'Дата начала',
      'end_date': 'Дата окончания',
      'send_station_code': 'Код станции отправления',
      'send_station': 'Станция отправления',
      'cargo_group': 'Код группы груза',
      'cargo': 'Наименование груза',
      'cargo_sender': 'Грузоотправитель',
      'payment': 'Плательщик',
      'contract_num': 'Номер договора',
      'notification_number': 'Номер уведомления',
      'cargo_name': 'Наименование груза',
      'receiver': 'Получатель',
      'sender': 'Отправитель',
      'receiver_name': 'Получатель',
      'sender_name': 'Отправитель',
      'weight': 'Вес',
      'sender_okpo': 'Код ОКПО отправителя',
      'receiver_okpo': 'Код ОКПО получателя',
      // ГУ-2б
      'notification_type': 'Тип уведомления',
      'station_name': 'Станция',
      'road_name': 'Дорога',
      'hour': 'Часы',
      'minutes': 'Минуты',
      'day': 'Число',
      'month': 'Месяц',
      'client_name': 'Наименование клиента',
      'transfer_place': 'Место передачи',
      'locomotive': 'Локомотив',
      'sequence_number': 'Порядковый номер',
      'container_number': 'Номер контейнера',
      'seal_type': 'Тип ЗПУ',
      'seal_mark': 'Контрольный знак',
      'operation': 'Операция',
      'notes': 'Примечание',
      'client_agent': 'Представитель клиента',
      // ГУ-36
      'cargo_type': 'Тип груза',
      'arrival_date': 'Дата прибытия',
      'train_number': 'Номер поезда',
      'waybill_number': 'Номер квитанции',
      'receipt_date': 'Дата квитанции',
      'storage_hours': 'Время хранения',
      'storage_address': 'Адрес хранения',
      'agent_position': 'Должность представителя',
      'agent_name': 'ФИО представителя',
      'notification_datetime': 'Дата и время уведомления',
      // Накладные
      'date': 'Дата оформления',
      'total_weight': 'Общий вес (кг)',
      'packaging_type': 'Род упаковки',
      'application_number': 'Номер заявки ГУ-12',
      'agreement_date': 'Дата согласования заявки',
      'payer_code': 'Код плательщика',
      'payment_amount': 'Сумма провозной платы (руб.)',
      'contract_number': 'Номер договора',
      'departure_station_code': 'Код станции отправления',
      'arrival_station_code': 'Код станции назначения',
      'cargo_code': 'Код груза (ЕТСНГ)',
      'places_count': 'Количество мест',
      'wagon_count': 'Количество вагонов',
      'wagon_numbers': 'Номера вагонов',
      'container_tare': 'Тара контейнера (кг)',
      'container_capacity': 'Грузоподъемность контейнера (кг)',
      'container_count': 'Количество контейнеров',
      'container_numbers': 'Номера контейнеров',
      'container_type': 'Тип контейнера',
      'signature_sender': 'Подпись отправителя',
      'signature_receiver': 'Подпись перевозчика',
    };
    
    // Фильтруем только заполненные поля (не null, не undefined, не пустая строка)
    const filledEntries = Object.entries(formData).filter(([key, value]) => {
      return value !== null && value !== undefined && value !== '';
    });
    
    // Формируем HTML только для заполненных полей
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docData.type}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', Georgia, serif; background: white; padding: 40px; margin: 0; }
            .document { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 30px 30px 20px; border-bottom: 2px solid #2860F0; }
            .header h1 { font-size: 24px; font-weight: bold; color: #1a2c3e; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .header .form-number { font-size: 14px; color: #666; margin-top: 5px; }
            .header .date { font-size: 12px; color: #999; margin-top: 10px; }
            .content { padding: 30px; }
            .info-row { display: flex; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e0e0e0; }
            .info-label { width: 220px; font-weight: 600; color: #2c3e50; font-size: 14px; }
            .info-value { flex: 1; color: #1a2c3e; font-size: 14px; line-height: 1.5; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 11px; color: #999; }
            .stamp { margin-top: 30px; display: flex; justify-content: space-between; padding: 0 20px; }
            .stamp div { text-align: center; font-size: 12px; color: #666; }
            .signature-line { width: 200px; border-top: 1px solid #000; margin-top: 5px; }
            @media print { body { padding: 0; } .document { box-shadow: none; border: none; } }
          </style>
        </head>
        <body>
          <div class="document">
            <div class="header">
              <h1>${docData.type}</h1>
              <div class="date">Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
              <div class="form-number">Документ №${docData.id}</div>
            </div>
            <div class="content">
              ${filledEntries.map(([key, value]) => {
                let displayValue = value;
                if (typeof value === 'object') {
                  displayValue = JSON.stringify(value, null, 2);
                }
                const label = fieldLabels[key] || key.replace(/_/g, ' ');
                return `
                  <div class="info-row">
                    <div class="info-label">${label}:</div>
                    <div class="info-value">${String(displayValue)}</div>
                  </div>
                `;
              }).join('')}
              <div class="stamp">
                <div>
                  <div>М.П.</div>
                  <div class="signature-line"></div>
                  <div>Подпись отправителя</div>
                </div>
                <div>
                  <div>М.П.</div>
                  <div class="signature-line"></div>
                  <div>Подпись перевозчика</div>
                </div>
              </div>
            </div>
            <div class="footer">
              Настоящий документ является официальным и имеет юридическую силу<br>
              Система электронного документооборота "Documentob Diplom"
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          <\/script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } else {
      alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
    }
    
  } catch (error) {
    console.error('Ошибка печати:', error);
    alert('Ошибка при подготовке документа к печати');
  }
};

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
     
      
      {/* Кнопка назад */}
      <div className="absolute top-4 left-6 z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Закрыть
        </button>
      </div>

    

      {/* Основной контент */}
      <div className="pt-20 px-6 pb-6">
        <div className="w-full">
          {/* Информация о пользователе */}
          <div className="mb-6">
           <h1 className="text-2xl font-bold text-[#2860F0]">
  Документы пользователя: {userName || `ID: ${userId}`}
</h1>
          </div>

          {/* Поиск */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск документов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2860F0] focus:ring-1 focus:ring-[#2860F0]"
              />
            </div>
          </div>

          {/* Таблица с документами */}
        <div className="bg-white rounded-[20px] shadow-md">
  {/* Шапка таблицы */}
  <div className="grid grid-cols-3 gap-4 px-6 py-3 rounded-t-[20px]" style={{ backgroundColor: '#E4E0FF', border: '1.5px solid #7C5CFC', borderBottom: 'none' }}>
    <div className="flex items-center justify-between text-[#7C5CFC] font-semibold">
      <span>Время создания</span>
      <button onClick={toggleSortOrder} className="ml-2 hover:opacity-70 transition-opacity">
        <img src={sortIcon} alt="Сортировка" style={{ width: '20px', height: '15px' }} />
      </button>
    </div>
    <div className="text-[#7C5CFC] font-semibold">Тип документа</div>
    <div className="text-[#7C5CFC] font-semibold">Печатные формы</div>
  </div>

  {/* Тело таблицы */}
  <div className="divide-y divide-gray-100 rounded-b-[20px] overflow-hidden">
    {isLoading ? (
      <div className="px-6 py-8 text-center text-gray-500" style={{ backgroundColor: '#EFECF9' }}>
        Загрузка документов...
      </div>
    ) : userId && sortedDocuments.length > 0 ? (
      sortedDocuments.map((doc) => (
        <div
          key={doc.id}
          className="grid grid-cols-3 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ backgroundColor: '#EFECF9' }}
          onClick={() => handleOpenDocument(doc.id)}
        >
          <div className="text-gray-700">{formatDate(doc.date)}</div>
          <div className="text-gray-700 font-medium text-[#2860F0]">{doc.type}</div>
          <div className="text-gray-700">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDocument(doc.id);
              }}
              className="text-[#2860F0] hover:underline"
            >
              📄 Открыть
            </button>
          </div>
        </div>
      ))
    ) : (
      <div className="px-6 py-8 text-center text-gray-500" style={{ backgroundColor: '#EFECF9' }}>
        {userId ? 'Документы не найдены' : 'Выберите пользователя для просмотра документов'}
      </div>
    )}
  </div>
</div>

          {/* Информация о количестве документов */}
          {userId && !isLoading && (
            <div className="mt-4 text-sm text-gray-500">
              Найдено документов: {sortedDocuments.length}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно с данными документа */}
      {/* Модальное окно с данными документа */}
{isApplicationModalOpen && selectedDocument && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
    <div className="w-[800px] max-h-[90vh] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl flex flex-col">
      
      {/* Шапка */}
      <div className="bg-[#C9D9FF] px-6 py-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {formatDate(selectedDocument.date)} / {selectedDocument.type}
        </h3>
      </div>
      
      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#6990F5]">
        <div className="bg-white rounded-lg shadow-lg p-6">
          
          {/* ID и Тип документа */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#C9D9FF] rounded-lg p-3">
              <span className="text-sm text-[#434343] font-medium">ID документа:</span>
              <p className="text-gray-800 mt-1 font-semibold">{selectedDocument.id}</p>
            </div>
            <div className="bg-[#C9D9FF] rounded-lg p-3">
              <span className="text-sm text-[#434343] font-medium">Тип документа:</span>
              <p className="text-gray-800 mt-1 font-semibold">{selectedDocument.type}</p>
            </div>
          </div>
          
          {/* Поля документа - только заполненные, с русскими названиями */}
          <div className="bg-[#C9D9FF] rounded-lg p-4">
            <span className="text-sm text-[#434343] font-medium mb-3 block">Данные документа:</span>
            
            <div className="space-y-2">
              {(() => {
                let formData = selectedDocument.form_data;
                if (typeof formData === 'string') {
                  try {
                    formData = JSON.parse(formData);
                  } catch (e) {
                    formData = {};
                  }
                }
                
                // Русские названия для всех полей (включая накладные)
                const fieldLabels: Record<string, string> = {
                  // ГУ-27
                  'document_number': 'Номер документа',
                  'wagon_number': 'Номер вагона',
                  'wagon_type': 'Род вагона',
                  'load_capacity': 'Грузоподъемность (тонн)',
                  'departure_station': 'Станция отправления',
                  'arrival_station': 'Станция прибытия',
                  'distance': 'Расстояние (км)',
                  // ГУ-12
                  'transporting_company': 'Перевозчик',
                  'app_coord_date': 'Дата согласования заявки',
                  'reg_date': 'Дата регистрации заявки',
                  'bid_number': 'Номер заявки',
                  'start_date': 'Дата начала',
                  'end_date': 'Дата окончания',
                  'send_station_code': 'Код станции отправления',
                  'send_station': 'Станция отправления',
                  'cargo_group': 'Код группы груза',
                  'cargo': 'Наименование груза',
                  'cargo_sender': 'Грузоотправитель',
                  'payment': 'Плательщик',
                  'contract_num': 'Номер договора',
                  'notification_number': 'Номер уведомления',
                  'cargo_name': 'Наименование груза',
                  'receiver': 'Получатель',
                  'sender': 'Отправитель',
                  'receiver_name': 'Получатель',
                  'sender_name': 'Отправитель',
                  'weight': 'Вес',
                  'sender_okpo': 'Код ОКПО отправителя',
                  'receiver_okpo': 'Код ОКПО получателя',
                  'places_count': 'Количество мест',
                  'package_type': 'Род упаковки',
                  'declared_value': 'Сумма объявленной ценности',
                  'receiving_agent': 'Приемосдатчик',
                  'signature_sender': 'Подпись отправителя',
                  'signature_receiver': 'Подпись перевозчика',
                  // ГУ-2б
                  'notification_type': 'Тип уведомления',
                  'station_name': 'Станция',
                  'road_name': 'Дорога',
                  'hour': 'Часы',
                  'minutes': 'Минуты',
                  'day': 'Число',
                  'month': 'Месяц',
                  'client_name': 'Наименование клиента',
                  'transfer_place': 'Место передачи',
                  'locomotive': 'Локомотив',
                  'sequence_number': 'Порядковый номер',
                  'container_number': 'Номер контейнера',
                  'seal_type': 'Тип ЗПУ',
                  'seal_mark': 'Контрольный знак',
                  'operation': 'Операция',
                  'notes': 'Примечание',
                  'client_agent': 'Представитель клиента',
                  // ГУ-36
                  'cargo_type': 'Тип груза',
                  'arrival_date': 'Дата прибытия',
                  'train_number': 'Номер поезда',
                  'waybill_number': 'Номер квитанции',
                  'receipt_date': 'Дата квитанции',
                  'storage_hours': 'Время хранения',
                  'storage_address': 'Адрес хранения',
                  'agent_position': 'Должность представителя',
                  'agent_name': 'ФИО представителя',
                  'notification_datetime': 'Дата и время уведомления',
                  // Накладные (дополнительные)
                  'date': 'Дата оформления',
                  'total_weight': 'Общий вес (кг)',
                  'packaging_type': 'Род упаковки',
                  'application_number': 'Номер заявки ГУ-12',
                  'agreement_date': 'Дата согласования заявки',
                  'payer_code': 'Код плательщика',
                  'payment_amount': 'Сумма провозной платы (руб.)',
                  'contract_number': 'Номер договора',
                  'departure_station_code': 'Код станции отправления',
                  'arrival_station_code': 'Код станции назначения',
                  'cargo_code': 'Код груза (ЕТСНГ)',
                  'wagon_count': 'Количество вагонов',
                  'wagon_numbers': 'Номера вагонов',
                  'container_tare': 'Тара контейнера (кг)',
                  'container_capacity': 'Грузоподъемность контейнера (кг)',
                  'container_count': 'Количество контейнеров',
                  'container_numbers': 'Номера контейнеров',
                  'container_type': 'Тип контейнера',
                  'option_name': 'Вариант оформления',
                  'waybill_type_name': 'Тип накладной',
                };
                
                if (formData && typeof formData === 'object') {
                  // Фильтруем только заполненные поля (не null, не undefined, не пустая строка)
                  const filledEntries = Object.entries(formData).filter(([key, value]) => {
                    return value !== null && value !== undefined && value !== '';
                  });
                  
                  if (filledEntries.length === 0) {
                    return (
                      <div className="text-center text-gray-400 py-4">
                        Нет данных для отображения
                      </div>
                    );
                  }
                  
                  return filledEntries.map(([key, value]) => {
                    let displayValue = value;
                    if (typeof value === 'object') {
                      displayValue = JSON.stringify(value, null, 2);
                    }
                    
                    // Пропускаем служебные скрытые поля
                    if (key === 'option_name' || key === 'waybill_type_name') {
                      return null;
                    }
                    
                    // Получаем русское название
                    const label = fieldLabels[key] || key.replace(/_/g, ' ');
                    
                    return (
                      <div key={key} className="flex py-2 border-b border-[#C9D9FF] last:border-0">
                        <div className="w-44 font-medium text-[#434343] text-sm">
                          {label}:
                        </div>
                        <div className="flex-1 text-gray-800 text-sm break-words">
                          {String(displayValue)}
                        </div>
                      </div>
                    );
                  }).filter(Boolean); // убираем null элементы
                }
                
                return (
                  <div className="text-center text-gray-400 py-4">
                    Нет данных для отображения
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Кнопки */}
      <div className="bg-[#C9D9FF] px-6 py-4 flex gap-3">
        <button
          onClick={handleOpenPrintForm}
          className="flex-1 py-2 bg-[#2860F0] hover:bg-[#4475F7] text-white font-medium rounded-lg transition-colors border border-white flex items-center justify-center gap-2"
        >
          🖨️ Печатная форма
        </button>
        <button
          onClick={() => {
            setIsApplicationModalOpen(false);
            setSelectedFormData(null);
          }}
          className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors border border-white"
        >
          ❌ Закрыть
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}