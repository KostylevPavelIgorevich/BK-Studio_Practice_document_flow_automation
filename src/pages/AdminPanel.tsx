import { useState } from 'react';
import { Navbar } from '../components/Navbar';

interface AdminPanelProps {
  onLogout: () => void;
}

// Заглушка данных для групп
const mockGroups = [
  { id: 1, name: 'Иванов Иван Иванович' },
  { id: 2, name: 'Петров Петр Петрович' },
  { id: 3, name: 'Сидоров Сидор Сидорович' },
  { id: 4, name: 'Кузнецова Анна Сергеевна' },
  { id: 5, name: 'Смирнов Алексей Дмитриевич' },
];

// Заглушка данных для пользователей
const mockUsers = [
  { id: 1, lastName: 'Алексеев', firstName: 'Алексей', middleName: 'Алексеевич', login: 'alekseev', password: '123', groupId: 1 },
  { id: 2, lastName: 'Борисова', firstName: 'Борислава', middleName: 'Борисовна', login: 'borisova', password: '123', groupId: 2 },
  { id: 3, lastName: 'Владимиров', firstName: 'Владимир', middleName: 'Владимирович', login: 'vladimirov', password: '123', groupId: 3 },
  { id: 4, lastName: 'Григорьев', firstName: 'Григорий', middleName: 'Григорьевич', login: 'grigoriev', password: '123', groupId: 4 },
  { id: 5, lastName: 'Дмитриева', firstName: 'Дарья', middleName: 'Дмитриевна', login: 'dmitrieva', password: '123', groupId: 5 },
  { id: 6, lastName: 'Евгеньев', firstName: 'Евгений', middleName: 'Евгеньевич', login: 'evgenev', password: '123', groupId: 1 },
  { id: 7, lastName: 'Жукова', firstName: 'Жанна', middleName: 'Жуковна', login: 'zhukova', password: '123', groupId: 2 },
  { id: 8, lastName: 'Зайцев', firstName: 'Захар', middleName: 'Зайцевич', login: 'zaytsev', password: '123', groupId: 3 },
];

export function AdminPanel({ onLogout }: AdminPanelProps) {
  // Состояния для левой панели
  const [groupSearch, setGroupSearch] = useState('');
  const [groups, setGroups] = useState(mockGroups);
  const [sortGroupsAsc, setSortGroupsAsc] = useState(true);

  // Состояния для правой панели
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const [sortUsersAsc, setSortUsersAsc] = useState(true);

  // Состояния для модальных окон
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  
  // Состояние для выбора вкладки в редактировании пользователя
  const [editUserTab, setEditUserTab] = useState<'userData' | 'loginPassword'>('userData');
  
  // Данные для форм
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  
  const [newUser, setNewUser] = useState({
    login: '',
    password: '',
    lastName: '',
    firstName: '',
    middleName: '',
    groupId: 1,
  });
  
  const [editUser, setEditUser] = useState({
    id: 0,
    login: '',
    password: '',
    lastName: '',
    firstName: '',
    middleName: '',
    groupId: 1,
  });

  // Фильтрация и сортировка
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    `${user.lastName} ${user.firstName} ${user.middleName}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortGroupsAsc) return a.name.localeCompare(b.name);
    return b.name.localeCompare(a.name);
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const fullNameA = `${a.lastName} ${a.firstName} ${a.middleName}`;
    const fullNameB = `${b.lastName} ${b.firstName} ${b.middleName}`;
    if (sortUsersAsc) return fullNameA.localeCompare(fullNameB);
    return fullNameB.localeCompare(fullNameA);
  });

  // Обработчики для групп
  const handleCreateGroup = () => {
    setNewGroupName('');
    setIsCreateGroupModalOpen(true);
  };

  const handleAcceptCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: groups.length + 1,
        name: newGroupName.trim(),
      };
      setGroups([...groups, newGroup]);
      setIsCreateGroupModalOpen(false);
      setNewGroupName('');
    }
  };

  const handleEditGroup = () => {
    setEditGroupName('');
    setSelectedGroupId(null);
    setIsEditGroupModalOpen(true);
  };

  const handleSelectGroupToEdit = (groupId: number, groupName: string) => {
    setSelectedGroupId(groupId);
    setEditGroupName(groupName);
  };

  const handleAcceptEditGroup = () => {
    if (selectedGroupId && editGroupName.trim()) {
      setGroups(groups.map(group =>
        group.id === selectedGroupId
          ? { ...group, name: editGroupName.trim() }
          : group
      ));
      setIsEditGroupModalOpen(false);
      setEditGroupName('');
      setSelectedGroupId(null);
    }
  };

  // Обработчики для пользователей
  const handleCreateUser = () => {
    setNewUser({
      login: '',
      password: '',
      lastName: '',
      firstName: '',
      middleName: '',
      groupId: groups[0]?.id || 1,
    });
    setIsCreateUserModalOpen(true);
  };

  const handleAcceptCreateUser = () => {
    if (newUser.login && newUser.password && newUser.lastName && newUser.firstName) {
      const newUserData = {
        id: users.length + 1,
        ...newUser,
      };
      setUsers([...users, newUserData]);
      setIsCreateUserModalOpen(false);
    }
  };

  const handleEditUser = () => {
    setEditUserTab('userData');
    setEditUser({
      id: 0,
      login: '',
      password: '',
      lastName: '',
      firstName: '',
      middleName: '',
      groupId: groups[0]?.id || 1,
    });
    setIsEditUserModalOpen(true);
  };

  const handleSelectUserToEdit = (user: typeof mockUsers[0]) => {
    setEditUser({
      id: user.id,
      login: user.login,
      password: user.password,
      lastName: user.lastName,
      firstName: user.firstName,
      middleName: user.middleName,
      groupId: user.groupId,
    });
  };

  const handleAcceptEditUser = () => {
    if (editUser.id) {
      setUsers(users.map(user =>
        user.id === editUser.id
          ? {
              ...user,
              login: editUser.login,
              password: editUser.password,
              lastName: editUser.lastName,
              firstName: editUser.firstName,
              middleName: editUser.middleName,
              groupId: editUser.groupId,
            }
          : user
      ));
      setIsEditUserModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
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
      <div className="flex gap-6 p-6 pt-20">
        
        {/* ЛЕВАЯ ПАНЕЛЬ - Группы */}
        <div className="w-1/4 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={handleCreateGroup}
              className="flex-1 py-2 bg-[#7C5CFC] hover:bg-[#6a48e8] text-white font-medium rounded-lg transition-colors"
            >
              Создать группу
            </button>
            <button
              onClick={handleEditGroup}
              className="flex-1 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors"
            >
              Изменить группу
            </button>
          </div>

          <input
            type="text"
            placeholder="Поиск групп..."
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2860F0] focus:ring-1 focus:ring-[#2860F0]"
          />

          <div className="bg-[#7C5CFC] rounded-lg px-4 py-2">
            <h2 className="text-white font-semibold">Группы учащихся</h2>
          </div>

          <div className="bg-white rounded-lg shadow-md max-h-[400px] overflow-y-auto">
            {sortedGroups.map((group) => (
              <div
                key={group.id}
                className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (isEditGroupModalOpen) {
                    handleSelectGroupToEdit(group.id, group.name);
                  }
                }}
              >
                <span className="text-gray-700">{group.name}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 text-center">Список всех обучаемых</p>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ - Пользователи */}
        <div className="w-3/4 space-y-4">
          <div className="flex gap-3">
            <button
              onClick={handleCreateUser}
              className="flex-1 py-2 bg-[#7C5CFC] hover:bg-[#6a48e8] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Создать пользователя
            </button>
            <button
              onClick={handleEditUser}
              className="flex-1 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Редактирование пользователя
            </button>
          </div>

          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2860F0] focus:ring-1 focus:ring-[#2860F0]"
          />

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#7C5CFC] rounded-lg px-4 py-2">
              <div className="flex items-center justify-between text-white font-semibold">
                <span>Фамилия</span>
                <button onClick={() => setSortUsersAsc(!sortUsersAsc)} className="hover:opacity-80">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="bg-[#7C5CFC] rounded-lg px-4 py-2">
              <span className="text-white font-semibold">Имя</span>
            </div>
            <div className="bg-[#7C5CFC] rounded-lg px-4 py-2">
              <span className="text-white font-semibold">Отчество</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md max-h-[400px] overflow-y-auto">
            {sortedUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-3 gap-4 px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (isEditUserModalOpen) {
                    handleSelectUserToEdit(user);
                  }
                }}
              >
                <span className="text-gray-700">{user.lastName}</span>
                <span className="text-gray-700">{user.firstName}</span>
                <span className="text-gray-700">{user.middleName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно: Создать группу */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[400px] bg-[#8778C3] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#E4E0FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">Создать группу</h3>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Введите название группы"
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]"
                autoFocus
              />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptCreateGroup} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg">Принять</button>
              <button onClick={() => setIsCreateGroupModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно: Изменить группу */}
      {isEditGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[400px] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">Изменить группу</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-white mb-2">Выберите группу из списка слева, затем измените название</p>
              <input
                type="text"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                placeholder="Новое название группы"
                className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]"
                disabled={!selectedGroupId}
              />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptEditGroup} disabled={!selectedGroupId} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] disabled:bg-[#7faa88] text-white font-medium rounded-lg">Принять</button>
              <button onClick={() => setIsEditGroupModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно: Создать пользователя */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] bg-[#8778C3] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#E4E0FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">Создать пользователя</h3>
            </div>
            <div className="p-6 space-y-3">
              <input type="text" value={newUser.login} onChange={(e) => setNewUser({...newUser, login: e.target.value})} placeholder="Логин" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" />
              <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="Пароль" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" />
              <input type="text" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} placeholder="Фамилия" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" />
              <input type="text" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} placeholder="Имя" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" />
              <input type="text" value={newUser.middleName} onChange={(e) => setNewUser({...newUser, middleName: e.target.value})} placeholder="Отчество" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" />
              <select value={newUser.groupId} onChange={(e) => setNewUser({...newUser, groupId: Number(e.target.value)})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:border-[#2860F0]">
                {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptCreateUser} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg">Принять</button>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно: Редактирование пользователя */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">Редактирование пользователя</h3>
            </div>
            <div className="flex gap-2 px-6 pt-4">
              <button onClick={() => setEditUserTab('userData')} className={`flex-1 py-2 border-2 border-white rounded-lg font-medium transition-colors ${editUserTab === 'userData' ? 'bg-[#2860F0] text-white' : 'bg-transparent text-white hover:bg-[#2860F0]/50'}`}>Данные пользователя</button>
              <button onClick={() => setEditUserTab('loginPassword')} className={`flex-1 py-2 border-2 border-white rounded-lg font-medium transition-colors ${editUserTab === 'loginPassword' ? 'bg-[#2860F0] text-white' : 'bg-transparent text-white hover:bg-[#2860F0]/50'}`}>Логин и пароль</button>
            </div>
            <div className="p-6 space-y-3">
              {editUserTab === 'userData' ? (
                <>
                  <p className="text-sm text-white mb-1">Выберите пользователя из списка справа</p>
                  <input type="text" value={editUser.lastName} onChange={(e) => setEditUser({...editUser, lastName: e.target.value})} placeholder="Фамилия" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" disabled={!editUser.id} />
                  <input type="text" value={editUser.firstName} onChange={(e) => setEditUser({...editUser, firstName: e.target.value})} placeholder="Имя" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" disabled={!editUser.id} />
                  <input type="text" value={editUser.middleName} onChange={(e) => setEditUser({...editUser, middleName: e.target.value})} placeholder="Отчество" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" disabled={!editUser.id} />
                  <select value={editUser.groupId} onChange={(e) => setEditUser({...editUser, groupId: Number(e.target.value)})} className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-800 focus:outline-none focus:border-[#2860F0]" disabled={!editUser.id}>
                    {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                  </select>
                </>
              ) : (
                <>
                  <p className="text-sm text-white mb-1">Выберите пользователя из списка справа</p>
                  <input type="text" value={editUser.login} onChange={(e) => setEditUser({...editUser, login: e.target.value})} placeholder="Логин" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" disabled={!editUser.id} />
                  <input type="password" value={editUser.password} onChange={(e) => setEditUser({...editUser, password: e.target.value})} placeholder="Пароль" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#2860F0]" disabled={!editUser.id} />
                </>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptEditUser} disabled={!editUser.id} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] disabled:bg-[#7faa88] text-white font-medium rounded-lg">Сохранить</button>
              <button onClick={() => setIsEditUserModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}