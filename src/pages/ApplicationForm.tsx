import { useState } from 'react';
import { Navbar } from '../components/Navbar';

interface ApplicationFormProps {
  onBack: () => void;
  onLogout: () => void;
}

export function ApplicationForm({ onBack, onLogout }: ApplicationFormProps) {
  // Состояния для полей
  const [documentType, setDocumentType] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [carrierOkpo, setCarrierOkpo] = useState('');
  const [validityFrom, setValidityFrom] = useState('');
  const [validityTo, setValidityTo] = useState('');
  const [sendSign, setSendSign] = useState('');
  const [countryDeparture, setCountryDeparture] = useState('');
  const [stationDeparture, setStationDeparture] = useState('');
  const [stationFullName, setStationFullName] = useState('');
  const [stationCode, setStationCode] = useState('');
  
  // Новые поля
  const [messageTypeName, setMessageTypeName] = useState('');
  const [cargoGroupCode, setCargoGroupCode] = useState('');
  const [cargoGroupName, setCargoGroupName] = useState('');
  const [cargoExactName, setCargoExactName] = useState('');
  const [cargoCode, setCargoCode] = useState('');
  const [shipperName, setShipperName] = useState('');
  const [shipperAddress, setShipperAddress] = useState('');
  const [shipperOkpo, setShipperOkpo] = useState('');

  // Состояния для галочек
  const [carrierChecked, setCarrierChecked] = useState(false);
  const [okpoChecked, setOkpoChecked] = useState(false);
  const [stationChecked, setStationChecked] = useState(false);
  const [stationFullChecked, setStationFullChecked] = useState(false);
  const [codeChecked, setCodeChecked] = useState(false);
  
  // Новые галочки
  const [messageTypeChecked, setMessageTypeChecked] = useState(false);
  const [cargoGroupCodeChecked, setCargoGroupCodeChecked] = useState(false);
  const [cargoGroupNameChecked, setCargoGroupNameChecked] = useState(false);
  const [cargoExactNameChecked, setCargoExactNameChecked] = useState(false);
  const [cargoCodeChecked, setCargoCodeChecked] = useState(false);
  const [shipperNameChecked, setShipperNameChecked] = useState(false);
  const [shipperAddressChecked, setShipperAddressChecked] = useState(false);
  const [shipperOkpoChecked, setShipperOkpoChecked] = useState(false);

  // Состояния для модального окна печати
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrintFormModalOpen, setIsPrintFormModalOpen] = useState(false);
  const [selectedForms, setSelectedForms] = useState({
    gu12: false,
    gu114: false,
  });

  const sendSignOptions = ['ВО', 'КО', 'МО'];
  const countryOptions = ['Россия', 'Казахстан', 'Беларусь', 'Китай', 'Другие'];

  const handleCheckClick = (setter: React.Dispatch<React.SetStateAction<boolean>>, currentValue: boolean) => {
    setter(!currentValue);
  };

  const handlePrintClick = () => {
    setIsPrintModalOpen(true);
  };

  const handleAcceptPrint = () => {
    setIsPrintModalOpen(false);
    setIsPrintFormModalOpen(true);
  };

  const handleFormCheck = (form: 'gu12' | 'gu114') => {
    setSelectedForms(prev => ({
      ...prev,
      [form]: !prev[form]
    }));
  };

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
      {/* Кнопки навигации */}
      <div className="absolute top-4 left-6 z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          В начало
        </button>
      </div>

      <div className="absolute top-4 right-6 z-10">
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors shadow-md"
        >
          Выход
        </button>
      </div>

      {/* Основной контент */}
      <div className="pt-20 pb-12">
        <div className="w-full px-0">
          {/* Заголовок */}
          <div className="bg-[#BBB1FA] py-4 px-6 mb-0">
            <h1 className="text-2xl font-bold text-gray-800">
              Оформление заявки на перевозку грузов
            </h1>
          </div>

          {/* Реквизиты документа */}
          <div className="bg-[#BBB1FA] py-4 px-6">
            <h2 className="text-xl font-semibold text-gray-800">Реквизиты документа</h2>
          </div>

          {/* Тип документа */}
          <div className="bg-white py-3 px-6 flex items-center">
            <label className="w-48 text-gray-700 font-medium">Тип документа</label>
            <input
              type="text"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="Введите тип документа"
              className="flex-1 max-w-md px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-[10px] text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
          </div>

          {/* Дата регистрации */}
          <div className="bg-white py-3 px-6 flex items-center">
            <label className="w-48 text-gray-700 font-medium">Дата регистрации</label>
            <div className="bg-[#C9D9FF] p-2 rounded-lg">
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-[170px] h-10 px-3 bg-[#E4E9F8] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
              />
            </div>
          </div>

          {/* Сведения о перевозке */}
          <div className="bg-[#BBB1FA] py-4 px-6 mt-2">
            <h2 className="text-xl font-semibold text-gray-800">Сведения о перевозке</h2>
          </div>

          {/* Наименование перевозчика */}
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Наименование перевозчика</label>
            <input
              type="text"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              placeholder="Введите наименование"
              className="flex-1 max-w-[756px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setCarrierChecked, carrierChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                carrierChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          {/* Код ОКПО перевозчика */}
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Код ОКПО</label>
            <input
              type="text"
              value={carrierOkpo}
              onChange={(e) => setCarrierOkpo(e.target.value)}
              placeholder="Введите код ОКПО"
              className="flex-1 max-w-[756px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setOkpoChecked, okpoChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                okpoChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          {/* Срок действия заявки */}
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Срок действия заявки</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">С</span>
                <input
                  type="date"
                  value={validityFrom}
                  onChange={(e) => setValidityFrom(e.target.value)}
                  className="w-[204px] h-10 px-3 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">До</span>
                <input
                  type="date"
                  value={validityTo}
                  onChange={(e) => setValidityTo(e.target.value)}
                  className="w-[204px] h-10 px-3 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Признак отправки */}
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Признак отправки</label>
            <select
              value={sendSign}
              onChange={(e) => setSendSign(e.target.value)}
              className="w-[170px] h-10 px-3 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            >
              <option value="">Выберите</option>
              {sendSignOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Страна отправления */}
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Страна отправления</label>
            <select
              value={countryDeparture}
              onChange={(e) => setCountryDeparture(e.target.value)}
              className="w-[501px] h-10 px-3 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            >
              <option value="">Выберите страну</option>
              {countryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Станция отправления */}
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Станция отправления</label>
            <input
              type="text"
              value={stationDeparture}
              onChange={(e) => setStationDeparture(e.target.value)}
              placeholder="Введите станцию отправления"
              className="flex-1 max-w-[1370px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setStationChecked, stationChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                stationChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          {/* Полное наименование станции */}
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Полное наименование станции и инфраструктуры отправления</label>
            <input
              type="text"
              value={stationFullName}
              onChange={(e) => setStationFullName(e.target.value)}
              placeholder="Введите полное наименование"
              className="flex-1 max-w-[1370px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setStationFullChecked, stationFullChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                stationFullChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          {/* Код */}
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Код</label>
            <input
              type="text"
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value)}
              placeholder="Введите код"
              className="w-[416px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setCodeChecked, codeChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                codeChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          {/* Вид сообщения */}
          <div className="bg-[#BBB1FA] py-4 px-6 mt-2">
            <h2 className="text-xl font-semibold text-gray-800">Вид сообщения</h2>
          </div>
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Наименование вида сообщений</label>
            <input
              type="text"
              value={messageTypeName}
              onChange={(e) => setMessageTypeName(e.target.value)}
              placeholder="Введите наименование вида сообщений"
              className="flex-1 max-w-[1370px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setMessageTypeChecked, messageTypeChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                messageTypeChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          {/* Номенклатурная группа груза */}
          <div className="bg-[#BBB1FA] py-4 px-6 mt-2">
            <h2 className="text-xl font-semibold text-gray-800">Номенклатурная группа груза</h2>
          </div>
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Код Номенклатурной группы груза</label>
            <input
              type="text"
              value={cargoGroupCode}
              onChange={(e) => setCargoGroupCode(e.target.value)}
              placeholder="Введите код"
              className="w-[416px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setCargoGroupCodeChecked, cargoGroupCodeChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                cargoGroupCodeChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Наименование номенклатурной группы</label>
            <input
              type="text"
              value={cargoGroupName}
              onChange={(e) => setCargoGroupName(e.target.value)}
              placeholder="Введите наименование"
              className="flex-1 max-w-[1370px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setCargoGroupNameChecked, cargoGroupNameChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                cargoGroupNameChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Точное наименование груза</label>
            <input
              type="text"
              value={cargoExactName}
              onChange={(e) => setCargoExactName(e.target.value)}
              placeholder="Введите точное наименование груза"
              className="flex-1 max-w-[1370px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setCargoExactNameChecked, cargoExactNameChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                cargoExactNameChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Код груза</label>
            <input
              type="text"
              value={cargoCode}
              onChange={(e) => setCargoCode(e.target.value)}
              placeholder="Введите код груза"
              className="w-[416px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setCargoCodeChecked, cargoCodeChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                cargoCodeChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          {/* Грузоотправитель */}
          <div className="bg-[#BBB1FA] py-4 px-6 mt-2">
            <h2 className="text-xl font-semibold text-gray-800">Грузоотправитель</h2>
          </div>
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">
              Наименование владельца<br />
              <span className="text-xs text-gray-500">(железнодорожного пути необщего пользования)</span>
            </label>
            <input
              type="text"
              value={shipperName}
              onChange={(e) => setShipperName(e.target.value)}
              placeholder="Введите наименование"
              className="flex-1 max-w-[1370px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setShipperNameChecked, shipperNameChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                shipperNameChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Почтовый адрес</label>
            <input
              type="text"
              value={shipperAddress}
              onChange={(e) => setShipperAddress(e.target.value)}
              placeholder="Введите почтовый адрес"
              className="w-[464px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setShipperAddressChecked, shipperAddressChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                shipperAddressChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
          <div className="bg-[#F8F7FF] py-3 px-6 flex items-center">
            <label className="w-64 text-gray-700 font-medium">Код ОКПО</label>
            <input
              type="text"
              value={shipperOkpo}
              onChange={(e) => setShipperOkpo(e.target.value)}
              placeholder="Введите код ОКПО"
              className="w-[416px] h-10 px-4 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] transition-all"
            />
            <button
              onClick={() => handleCheckClick(setShipperOkpoChecked, shipperOkpoChecked)}
              className={`ml-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                shipperOkpoChecked ? 'bg-[#3ABC96]' : 'bg-[#2860F0]'
              } hover:opacity-80`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          {/* Футер с кнопками */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6 flex justify-center gap-4 z-20">
            <button
              onClick={() => console.log('Сохранить')}
              className="w-[161px] h-[54px] bg-[#4475F7] hover:bg-[#3662d9] text-white font-medium rounded-lg transition-all border border-white focus:shadow-[0_0_5px_#4D6BB7]"
              style={{ boxShadow: 'none' }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = '0 0 5px #4D6BB7';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Сохранить
            </button>
            <button
              onClick={handlePrintClick}
              className="w-[161px] h-[54px] bg-[#C5C6D0] hover:bg-[#3ABC96] hover:text-white hover:border-white text-[#919191] font-medium rounded-lg transition-all border border-[#919191] focus:shadow-[0_0_5px_#2B8B6F]"
            >
              Печать
            </button>
            <button
              onClick={() => console.log('В накладную')}
              className="w-[161px] h-[54px] bg-[#C5C6D0] hover:bg-[#3ABC96] hover:text-white hover:border-white text-[#919191] font-medium rounded-lg transition-all border border-[#919191] focus:shadow-[0_0_5px_#2B8B6F]"
            >
              В накладную
            </button>
          </div>

          {/* Отступ для футера */}
          <div className="h-24" />
        </div>
      </div>

      {/* Модальное окно выбора печатных форм */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-[#2860F0]">Выберите необходимые печатные формы</h3>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedForms.gu12}
                  onChange={() => handleFormCheck('gu12')}
                  className="w-5 h-5 accent-[#7C5CFC] bg-[#BBB1FA] border border-[#919191] rounded"
                />
                <span className="text-white text-lg">Гу-12</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedForms.gu114}
                  onChange={() => handleFormCheck('gu114')}
                  className="w-5 h-5 accent-[#7C5CFC] bg-[#BBB1FA] border border-[#919191] rounded"
                />
                <span className="text-white text-lg">ГУ-114</span>
              </label>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleAcceptPrint}
                className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg transition-colors"
              >
                Принять
              </button>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно печатной формы */}
      {isPrintFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="w-[800px] max-h-[90vh] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Печатная форма
              </h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-3">
                  <div className="bg-[#C9D9FF] rounded-lg p-3">
                    <p className="text-gray-800">Содержимое печатной формы будет здесь</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#C9D9FF] px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-[#2860F0] hover:bg-[#4475F7] text-white font-medium rounded-lg transition-colors border border-white"
              >
                Печать
              </button>
              <button
                onClick={() => setIsPrintFormModalOpen(false)}
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