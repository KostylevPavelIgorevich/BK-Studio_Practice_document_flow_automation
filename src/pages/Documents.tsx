import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';

interface DocumentsProps {
  userName?: string;
  userId?: number;
  userRole: 'admin' | 'user';
  onBack: () => void;
  onLogout: () => void;
}

// Заглушка данных для документов (разные для разных пользователей)
const allUsersDocuments: Record<number, Array<{ id: number; date: string; type: string; printForms: string }>> = {
  1: [
    { id: 1, date: '2024-03-15T10:30:00', type: 'Заявка', printForms: 'Акт, Счет' },
    { id: 2, date: '2024-03-20T14:15:00', type: 'Счет-фактура', printForms: 'Накладная' },
    { id: 3, date: '2024-03-10T09:00:00', type: 'Акт выполненных работ', printForms: 'Акт, Счет-фактура' },
    { id: 4, date: '2024-03-25T16:45:00', type: 'Транспортная накладная', printForms: 'ТТН' },
    { id: 5, date: '2024-03-18T11:20:00', type: 'Прочие формы', printForms: 'Различные формы' },
  ],
  2: [
    { id: 1, date: '2024-03-16T11:30:00', type: 'Заявка', printForms: 'Акт, Счет' },
    { id: 2, date: '2024-03-21T15:15:00', type: 'Транспортная накладная', printForms: 'ТТН' },
    { id: 3, date: '2024-03-22T13:00:00', type: 'Счет на оплату', printForms: 'Счет' },
  ],
  3: [
    { id: 1, date: '2024-03-18T09:45:00', type: 'Прочие формы', printForms: 'Различные формы' },
    { id: 2, date: '2024-03-22T12:30:00', type: 'Договор аренды', printForms: 'Акт приема-передачи' },
    { id: 3, date: '2024-03-12T08:30:00', type: 'Акт сверки', printForms: 'Акт сверки' },
  ],
};

// Заглушка списка всех пользователей для админа
const allUsersList = [
  { id: 1, name: 'Алексеев Алексей Алексеевич' },
  { id: 2, name: 'Борисова Борислава Борисовна' },
  { id: 3, name: 'Владимиров Владимир Владимирович' },
];

// Данные для заявки
const applicationData = {
  type: 'Заявка на перевозку грузов ГУ-12',
  registrationDate: '26-08-2025',
  messageType: 'Прямое',
  periodStart: '28-08-2025',
  periodEnd: '28-08-2025',
  sendSign: 'Контейнерная КО',
  sendType: '8',
  speed: 'Грузовая',
  contractNumber: '678798',
  submissionMethod: 'Ежедневно',
  schedule: '28-08-2025',
  payer: 'ООО Капитал',
  payerCode: '3764569818',
  payerOKPO: '35647890',
  payerAddress: 'РФ, г. Новосибирск, ул. Таежная 11',
  countryDeparture: '643',
  stationDeparture: '546780',
  roadCode: '88',
  stationCode: '876543',
};

// Данные для прочих форм
const otherFormsData: Record<string, any> = {
  'Памятка приемосдатчика': {
    type: 'Памятка приемосдатчика ГУ-45',
    registrationDate: '28-03-2025',
    messageType: 'Прямое',
    periodStart: '30-03-2025',
    periodEnd: '30-03-2025',
    sendSign: 'Контейнерная КО',
    sendType: '8',
    speed: 'Грузовая',
    contractNumber: '123456',
    submissionMethod: 'Ежедневно',
    schedule: '30-03-2025',
    payer: 'ООО ТрансЛогистик',
    payerCode: '1234567890',
    payerOKPO: '12345678',
    payerAddress: 'РФ, г. Москва, ул. Логистическая 15',
    countryDeparture: '643',
    stationDeparture: '123456',
    roadCode: '77',
    stationCode: '234567',
  },
  'Ведомость подачи и уборки вагона': {
    type: 'Ведомость подачи и уборки вагона ГУ-46',
    registrationDate: '27-03-2025',
    messageType: 'Прямое',
    periodStart: '29-03-2025',
    periodEnd: '29-03-2025',
    sendSign: 'Контейнерная КО',
    sendType: '8',
    speed: 'Грузовая',
    contractNumber: '789012',
    submissionMethod: 'Ежедневно',
    schedule: '29-03-2025',
    payer: 'ООО ВагонСервис',
    payerCode: '9876543210',
    payerOKPO: '87654321',
    payerAddress: 'РФ, г. Санкт-Петербург, ул. Вагонная 5',
    countryDeparture: '643',
    stationDeparture: '345678',
    roadCode: '66',
    stationCode: '456789',
  },
  'Опись контейнера': {
    type: 'Опись контейнера ГУ-47',
    registrationDate: '26-03-2025',
    messageType: 'Прямое',
    periodStart: '28-03-2025',
    periodEnd: '28-03-2025',
    sendSign: 'Контейнерная КО',
    sendType: '8',
    speed: 'Грузовая',
    contractNumber: '345678',
    submissionMethod: 'Ежедневно',
    schedule: '28-03-2025',
    payer: 'ООО КонтейнерТранс',
    payerCode: '5555555555',
    payerOKPO: '55555555',
    payerAddress: 'РФ, г. Екатеринбург, ул. Контейнерная 10',
    countryDeparture: '643',
    stationDeparture: '567890',
    roadCode: '99',
    stationCode: '678901',
  },
  'Требование-накладная': {
    type: 'Требование-накладная ГУ-48',
    registrationDate: '25-03-2025',
    messageType: 'Прямое',
    periodStart: '27-03-2025',
    periodEnd: '27-03-2025',
    sendSign: 'Контейнерная КО',
    sendType: '8',
    speed: 'Грузовая',
    contractNumber: '901234',
    submissionMethod: 'Ежедневно',
    schedule: '27-03-2025',
    payer: 'ООО Грузоперевозки',
    payerCode: '1111111111',
    payerOKPO: '11111111',
    payerAddress: 'РФ, г. Новосибирск, ул. Грузовая 20',
    countryDeparture: '643',
    stationDeparture: '789012',
    roadCode: '88',
    stationCode: '890123',
  },
  'Требование на перемещение': {
    type: 'Требование на перемещение ГУ-49',
    registrationDate: '24-03-2025',
    messageType: 'Прямое',
    periodStart: '26-03-2025',
    periodEnd: '26-03-2025',
    sendSign: 'Контейнерная КО',
    sendType: '8',
    speed: 'Грузовая',
    contractNumber: '567890',
    submissionMethod: 'Ежедневно',
    schedule: '26-03-2025',
    payer: 'ООО ЛогистикСервис',
    payerCode: '2222222222',
    payerOKPO: '22222222',
    payerAddress: 'РФ, г. Казань, ул. Транспортная 8',
    countryDeparture: '643',
    stationDeparture: '901234',
    roadCode: '77',
    stationCode: '012345',
  },
};

export function Documents({ userName, userId, userRole, onBack, onLogout }: DocumentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isOtherFormsModalOpen, setIsOtherFormsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ id: number; type: string; date: string } | null>(null);
  const [selectedOtherForm, setSelectedOtherForm] = useState<string | null>(null);
  const [selectedFormData, setSelectedFormData] = useState<any>(null);
  
  // Состояния для админского выбора пользователя
  const [selectedUserId, setSelectedUserId] = useState<number | null>(userId || null);
  const [documents, setDocuments] = useState<any[]>([]);

  // Загрузка документов в зависимости от роли и выбранного пользователя
  useEffect(() => {
    if (userRole === 'admin' && selectedUserId) {
      setDocuments(allUsersDocuments[selectedUserId] || []);
    } else if (userRole === 'user' && userId) {
      setDocuments(allUsersDocuments[userId] || []);
    }
  }, [userRole, userId, selectedUserId]);

  // Фильтрация документов по поиску
  const filteredDocuments = documents.filter(doc =>
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.printForms.toLowerCase().includes(searchQuery.toLowerCase())
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
  const handleOpenDocument = (doc: { id: number; type: string; date: string }) => {
    setSelectedDocument(doc);
    if (doc.type === 'Прочие формы') {
      setIsOtherFormsModalOpen(true);
    } else {
      setIsApplicationModalOpen(true);
    }
  };

  // Открытие печатной формы
  const handleOpenPrintForm = () => {
    setIsApplicationModalOpen(false);
    setIsOtherFormsModalOpen(false);
    setIsPrintModalOpen(true);
  };

  // Выбор прочей формы
  const handleSelectOtherForm = (formName: string) => {
    setSelectedOtherForm(formName);
    setSelectedFormData(otherFormsData[formName]);
  };

  // Открытие выбранной прочей формы
  const handleOpenSelectedForm = () => {
    if (selectedOtherForm && selectedFormData) {
      setIsOtherFormsModalOpen(false);
      setIsApplicationModalOpen(true);
    }
  };

  // Получение имени пользователя для отображения
  const getDisplayUserName = () => {
    if (userRole === 'admin' && selectedUserId) {
      const user = allUsersList.find(u => u.id === selectedUserId);
      return user?.name || 'Выбранный пользователь';
    }
    return userName || 'Пользователь';
  };

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
      {/* Кнопка назад */}
      <div className="absolute top-4 left-6 z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад
        </button>
      </div>

      {/* Кнопка выхода */}
      <div className="absolute top-4 right-6 z-10">
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors shadow-md"
        >
          Выход
        </button>
      </div>

      {/* Основной контент */}
      <div className="pt-20 px-6 pb-6">
        <div className="w-full">
          {/* Информация о пользователе */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Документы пользователя</h1>
            <p className="text-gray-600 mt-1">
              Пользователь: <span className="font-semibold text-[#2860F0]">{getDisplayUserName()}</span>
            </p>
          </div>

          {/* Для админа - выбор пользователя */}
          {userRole === 'admin' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Выберите пользователя:</label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#2860F0] focus:ring-1 focus:ring-[#2860F0]"
              >
                <option value="">Выберите пользователя</option>
                {allUsersList.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          )}

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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Шапка таблицы */}
            <div className="grid grid-cols-3 gap-4 px-6 py-3 border-b" style={{ backgroundColor: '#E4E0FF' }}>
              <div className="flex items-center justify-between text-[#7C5CFC] font-semibold">
                <span>Время прохождения</span>
                <button
                  onClick={toggleSortOrder}
                  className="ml-2 hover:opacity-70 transition-opacity"
                >
                  <svg className="w-4 h-4 text-[#7C5CFC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {sortOrder === 'desc' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    )}
                  </svg>
                </button>
              </div>
              <div className="text-[#7C5CFC] font-semibold">Тип документа</div>
              <div className="text-[#7C5CFC] font-semibold">Печатные формы</div>
            </div>

            {/* Тело таблицы */}
            <div className="divide-y divide-gray-100">
              {selectedUserId && sortedDocuments.length > 0 ? (
                sortedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="grid grid-cols-3 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ backgroundColor: '#EFECF9' }}
                    onClick={() => handleOpenDocument(doc)}
                  >
                    <div className="text-gray-700">{formatDate(doc.date)}</div>
                    <div className="text-gray-700 font-medium text-[#2860F0]">{doc.type}</div>
                    <div className="text-gray-700">{doc.printForms}</div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500" style={{ backgroundColor: '#EFECF9' }}>
                  {!selectedUserId ? 'Выберите пользователя для просмотра документов' : 'Документы не найдены'}
                </div>
              )}
            </div>
          </div>

          {/* Информация о количестве документов */}
          {selectedUserId && (
            <div className="mt-4 text-sm text-gray-500">
              Найдено документов: {sortedDocuments.length}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для выбора прочей формы */}
      {isOtherFormsModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {formatDate(selectedDocument.date)} / {selectedDocument.type}
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-[#4475F7] border border-white rounded-lg p-4 mb-4">
                <p className="text-white text-center font-medium">
                  Выберите тип документа:
                </p>
              </div>
              {Object.keys(otherFormsData).map((formName) => (
                <div
                  key={formName}
                  onClick={() => handleSelectOtherForm(formName)}
                  className={`bg-[#C9D9FF] border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedOtherForm === formName
                      ? 'border-white bg-[#4475F7]'
                      : 'border-[#919191] hover:bg-[#b8c8ff]'
                  }`}
                >
                  <p className={`${selectedOtherForm === formName ? 'text-white' : 'text-gray-800'}`}>
                    {formName}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleOpenSelectedForm}
                disabled={!selectedOtherForm}
                className="flex-1 py-2 bg-[#2860F0] hover:bg-[#4475F7] disabled:bg-[#7a8fbf] text-white font-medium rounded-lg transition-colors border border-white"
              >
                Открыть
              </button>
              <button
                onClick={() => {
                  setIsOtherFormsModalOpen(false);
                  setSelectedOtherForm(null);
                  setSelectedFormData(null);
                }}
                className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors border border-white"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно с данными документа */}
      {isApplicationModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="w-[800px] max-h-[90vh] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {formatDate(selectedDocument.date)} / {selectedDocument.type}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Тип документа:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.type : applicationData.type}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Дата регистрации:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.registrationDate : applicationData.registrationDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Вид сообщения:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.messageType : applicationData.messageType}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Начало периода:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.periodStart : applicationData.periodStart}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Конец периода:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.periodEnd : applicationData.periodEnd}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Признак отправки:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.sendSign : applicationData.sendSign}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Вид отправки:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.sendType : applicationData.sendType}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Скорость:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.speed : applicationData.speed}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Номер договора:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.contractNumber : applicationData.contractNumber}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Способ подачи:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.submissionMethod : applicationData.submissionMethod}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">График подач:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.schedule : applicationData.schedule}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Плательщик:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.payer : applicationData.payer}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Код плательщика:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.payerCode : applicationData.payerCode}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">ОКПО плательщика:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.payerOKPO : applicationData.payerOKPO}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#C9D9FF] rounded-lg p-3">
                    <span className="text-sm text-[#434343] font-medium">Адрес плательщика:</span>
                    <p className="text-gray-800 mt-1">
                      {selectedFormData ? selectedFormData.payerAddress : applicationData.payerAddress}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Страна отправления:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.countryDeparture : applicationData.countryDeparture}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Станция отправления:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.stationDeparture : applicationData.stationDeparture}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Код дороги отправления:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.roadCode : applicationData.roadCode}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Код станции отправления:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.stationCode : applicationData.stationCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#C9D9FF] px-6 py-4 flex gap-3">
              <button
                onClick={handleOpenPrintForm}
                className="flex-1 py-2 bg-[#2860F0] hover:bg-[#4475F7] text-white font-medium rounded-lg transition-colors border border-white"
              >
                Печатная форма
              </button>
              <button
                onClick={() => {
                  setIsApplicationModalOpen(false);
                  setSelectedFormData(null);
                }}
                className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors border border-white"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно печатной формы */}
      {isPrintModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="w-[800px] max-h-[90vh] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Печатная форма: {formatDate(selectedDocument.date)} / {selectedDocument.type}
                {selectedOtherForm && ` - ${selectedOtherForm}`}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Тип документа:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.type : applicationData.type}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Дата регистрации:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.registrationDate : applicationData.registrationDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Вид сообщения:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.messageType : applicationData.messageType}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Начало периода:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.periodStart : applicationData.periodStart}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Конец периода:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.periodEnd : applicationData.periodEnd}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Признак отправки:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.sendSign : applicationData.sendSign}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Вид отправки:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.sendType : applicationData.sendType}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Скорость:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.speed : applicationData.speed}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Номер договора:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.contractNumber : applicationData.contractNumber}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Способ подачи:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.submissionMethod : applicationData.submissionMethod}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">График подач:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.schedule : applicationData.schedule}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Плательщик:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.payer : applicationData.payer}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Код плательщика:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.payerCode : applicationData.payerCode}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">ОКПО плательщика:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.payerOKPO : applicationData.payerOKPO}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#C9D9FF] rounded-lg p-3">
                    <span className="text-sm text-[#434343] font-medium">Адрес плательщика:</span>
                    <p className="text-gray-800 mt-1">
                      {selectedFormData ? selectedFormData.payerAddress : applicationData.payerAddress}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Страна отправления:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.countryDeparture : applicationData.countryDeparture}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Станция отправления:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.stationDeparture : applicationData.stationDeparture}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Код дороги отправления:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.roadCode : applicationData.roadCode}
                      </p>
                    </div>
                    <div className="bg-[#C9D9FF] rounded-lg p-3">
                      <span className="text-sm text-[#434343] font-medium">Код станции отправления:</span>
                      <p className="text-gray-800 mt-1">
                        {selectedFormData ? selectedFormData.stationCode : applicationData.stationCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#C9D9FF] px-6 py-4 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-[#2860F0] hover:bg-[#4475F7] text-white font-medium rounded-lg transition-colors border border-white"
              >
                Печать
              </button>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors border border-white"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}