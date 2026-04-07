import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Documents } from './Documents';
import { getGroups, createGroup, updateGroup, getUsers, createUser, updateUser } from '../services/api';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  // Состояния для левой панели
  const [groupSearch, setGroupSearch] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [sortGroupsAsc, setSortGroupsAsc] = useState(true);

  // Состояния для правой панели
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [sortUsersAsc, setSortUsersAsc] = useState(true);

  // Состояния для модальных окон
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  
  const [editUserTab, setEditUserTab] = useState<'userData' | 'loginPassword'>('userData');
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedUserIdForEdit, setSelectedUserIdForEdit] = useState<number | null>(null);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  
  // НОВЫЙ ПОЛЬЗОВАТЕЛЬ
  const [newUser, setNewUser] = useState({
    login: '',
    password: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    role_id: 2,
    group_id: 1,
  });
  
  const [editUser, setEditUser] = useState({
    id: 0,
    login: '',
    password: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    role_id: 2,
    group_id: 1,
  });

  // ========== ЗАГРУЗКА ДАННЫХ ИЗ БД ==========
  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
      if (data.length > 0) {
        setNewUser(prev => ({ ...prev, group_id: data[0].id }));
      }
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
      setGroups([]);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setUsers([]);
    }
  };

  // Фильтрация и сортировка
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    `${user.last_name} ${user.first_name} ${user.middle_name}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  const sortedGroups = [...filteredGroups].sort((a, b) =>
    sortGroupsAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const nameA = `${a.last_name} ${a.first_name} ${a.middle_name}`;
    const nameB = `${b.last_name} ${b.first_name} ${b.middle_name}`;
    return sortUsersAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  // ========== ГРУППЫ ==========
  const handleCreateGroup = () => {
    setNewGroupName('');
    setIsCreateGroupModalOpen(true);
  };

  const handleAcceptCreateGroup = async () => {
    if (newGroupName.trim()) {
      try {
        await createGroup(newGroupName.trim());
        await loadGroups();
        setIsCreateGroupModalOpen(false);
        setNewGroupName('');
      } catch (error) {
        console.error('Ошибка создания группы:', error);
        alert('Ошибка при создании группы');
      }
    } else {
      alert('Введите название группы');
    }
  };

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  const handleEditGroup = () => {
    if (selectedGroupId !== null) {
      const group = groups.find(g => g.id === selectedGroupId);
      if (group) {
        setEditGroupName(group.name);
        setIsEditGroupModalOpen(true);
      }
    } else {
      alert('Сначала выберите группу из списка');
    }
  };

  const handleAcceptEditGroup = async () => {
    if (selectedGroupId !== null && editGroupName.trim()) {
      try {
        await updateGroup(selectedGroupId, editGroupName.trim());
        await loadGroups();
        setIsEditGroupModalOpen(false);
        setEditGroupName('');
        setSelectedGroupId(null);
      } catch (error) {
        console.error('Ошибка изменения группы:', error);
        alert('Ошибка при изменении группы');
      }
    } else {
      alert('Введите название группы');
    }
  };

  // ========== ПОЛЬЗОВАТЕЛИ ==========
  const handleCreateUser = () => {
    setNewUser({
      login: '',
      password: '',
      last_name: '',
      first_name: '',
      middle_name: '',
      role_id: 2,
      group_id: groups[0]?.id || 1,
    });
    setIsCreateUserModalOpen(true);
  };

  const handleAcceptCreateUser = async () => {
    console.log('=== ОТЛАДКА СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ ===');
    console.log('Выбранный group_id:', newUser.group_id);
    console.log('Все группы из БД:', groups);
    
    if (!newUser.login.trim()) { alert('Введите логин'); return; }
    if (!newUser.password.trim()) { alert('Введите пароль'); return; }
    if (!newUser.last_name.trim()) { alert('Введите фамилию'); return; }
    if (!newUser.first_name.trim()) { alert('Введите имя'); return; }
    if (!newUser.group_id) { alert('Выберите группу'); return; }

    const groupExists = groups.some(g => g.id === newUser.group_id);
    if (!groupExists) {
      alert(`Группа с ID ${newUser.group_id} не существует!`);
      return;
    }

    try {
      const result = await createUser(newUser);
      console.log('Пользователь создан:', result);
      await loadUsers();
      setIsCreateUserModalOpen(false);
      setNewUser({
        login: '',
        password: '',
        last_name: '',
        first_name: '',
        middle_name: '',
        role_id: 2,
        group_id: groups[0]?.id || 1,
      });
      alert('Пользователь успешно создан!');
    } catch (error: any) {
      console.error('Ошибка создания пользователя:', error);
      alert(error.message || 'Ошибка при создании пользователя');
    }
  };

  const handleSelectUserForEdit = (userId: number) => {
    setSelectedUserIdForEdit(userId);
  };

  const handleEditUser = () => {
    if (selectedUserIdForEdit !== null) {
      const user = users.find(u => u.id === selectedUserIdForEdit);
      if (user) {
        setEditUser({
          id: user.id,
          login: user.login,
          password: '',
          last_name: user.last_name,
          first_name: user.first_name,
          middle_name: user.middle_name || '',
          role_id: user.role_id,
          group_id: user.group_id,
        });
        setEditUserTab('userData');
        setIsEditUserModalOpen(true);
      }
    } else {
      alert('Сначала выберите пользователя из списка');
    }
  };

  const handleAcceptEditUser = async () => {
    if (!editUser.id) return;
    
    if (!editUser.login.trim()) { alert('Введите логин'); return; }
    if (!editUser.last_name.trim()) { alert('Введите фамилию'); return; }
    if (!editUser.first_name.trim()) { alert('Введите имя'); return; }

    try {
      const updateData = { ...editUser };
      if (!updateData.password || updateData.password.trim() === '') {
        delete (updateData as any).password;
      }
      
      await updateUser(editUser.id, updateData);
      await loadUsers();
      setIsEditUserModalOpen(false);
      setSelectedUserIdForEdit(null);
      alert('Пользователь успешно обновлён!');
    } catch (error: any) {
      console.error('Ошибка редактирования пользователя:', error);
      alert(error.message || 'Ошибка при редактировании пользователя');
    }
  };

  // ========== ДОКУМЕНТЫ ==========
  const handleDoubleClickUser = (userId: number, fullName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(fullName);
    setShowDocuments(true);
  };

  const handleBackToAdmin = () => {
    setShowDocuments(false);
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  if (showDocuments) {
    return (
      <Documents
        userName={selectedUserName}
        userId={selectedUserId || undefined}
        userRole="admin"
        onBack={handleBackToAdmin}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      <div className="absolute top-4 right-6 z-10">
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg shadow-md">Выход</button>
      </div>
      <div className="flex gap-6 p-6 pt-[41px]">
        {/* ЛЕВАЯ ПАНЕЛЬ - Группы */}
        <div className="w-1/4 space-y-4">
          <div className="flex gap-3">
            <button onClick={handleCreateGroup} className="flex-1 py-2 bg-[#7C5CFC] hover:bg-[#6a48e8] text-white font-medium rounded-lg">Создать группу</button>
            <button onClick={handleEditGroup} className="flex-1 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg">Изменить группу</button>
          </div>
          <input type="text" placeholder="Поиск групп..." value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" />
          <div className="bg-[#7C5CFC] rounded-lg px-4 py-2">
            <div className="flex items-center justify-between text-white font-semibold">
              <h2>Группы учащихся</h2>
              <button onClick={() => setSortGroupsAsc(!sortGroupsAsc)}>↕️</button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md max-h-[400px] overflow-y-auto">
            {sortedGroups.map((group) => (
              <div key={group.id} className={`px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedGroupId === group.id ? 'bg-blue-100 border-l-4 border-[#2860F0]' : ''}`} onClick={() => handleSelectGroup(group.id)}>
                <span className="text-gray-700">{group.name}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">Список всех групп</p>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ - Пользователи */}
        <div className="w-3/4 space-y-4">
          <div className="flex gap-3">
            <button onClick={handleCreateUser} className="flex-1 py-2 bg-[#7C5CFC] hover:bg-[#6a48e8] text-white font-medium rounded-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Создать пользователя
            </button>
            <button onClick={handleEditUser} className="flex-1 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Редактирование пользователя
            </button>
          </div>
          <input type="text" placeholder="Поиск пользователей..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" />
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#7C5CFC] rounded-lg px-4 py-2"><div className="flex items-center justify-between text-white font-semibold"><span>Фамилия</span><button onClick={() => setSortUsersAsc(!sortUsersAsc)}>↕️</button></div></div>
            <div className="bg-[#7C5CFC] rounded-lg px-4 py-2"><span className="text-white font-semibold">Имя</span></div>
            <div className="bg-[#7C5CFC] rounded-lg px-4 py-2"><span className="text-white font-semibold">Отчество</span></div>
          </div>
          <div className="bg-white rounded-lg shadow-md max-h-[400px] overflow-y-auto">
            {sortedUsers.map((user) => {
              const fullName = `${user.last_name} ${user.first_name} ${user.middle_name}`;
              return (
                <div key={user.id} className={`grid grid-cols-3 gap-4 px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedUserIdForEdit === user.id ? 'bg-blue-100 border-l-4 border-[#2860F0]' : ''}`} onClick={() => handleSelectUserForEdit(user.id)} onDoubleClick={() => handleDoubleClickUser(user.id, fullName)}>
                  <span className="text-gray-700">{user.last_name}</span>
                  <span className="text-gray-700">{user.first_name}</span>
                  <span className="text-gray-700">{user.middle_name || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО: Создать группу */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[400px] bg-[#8778C3] rounded-lg shadow-xl">
            <div className="bg-[#E4E0FF] px-6 py-3"><h3 className="text-lg font-semibold">Создать группу</h3></div>
            <div className="p-6">
              <input 
                type="text" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                placeholder="Введите название группы" 
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" 
                autoFocus 
              />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptCreateGroup} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white rounded-lg">Принять</button>
              <button onClick={() => setIsCreateGroupModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: Изменить группу */}
      {isEditGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[400px] bg-[#6990F5] rounded-lg shadow-xl">
            <div className="bg-[#C9D9FF] px-6 py-3"><h3 className="text-lg font-semibold">Изменить группу</h3></div>
            <div className="p-6">
              <input 
                type="text" 
                value={editGroupName} 
                onChange={(e) => setEditGroupName(e.target.value)} 
                placeholder="Новое название группы" 
                className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900" 
              />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptEditGroup} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white rounded-lg">Сохранить</button>
              <button onClick={() => setIsEditGroupModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: Создать пользователя */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] bg-[#8778C3] rounded-lg shadow-xl">
            <div className="bg-[#E4E0FF] px-6 py-3"><h3 className="text-lg font-semibold">Создать пользователя</h3></div>
            <div className="p-6 space-y-3">
              <input type="text" value={newUser.login} onChange={(e) => setNewUser({...newUser, login: e.target.value})} placeholder="Логин *" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
              <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="Пароль *" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
              <input type="text" value={newUser.last_name} onChange={(e) => setNewUser({...newUser, last_name: e.target.value})} placeholder="Фамилия *" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
              <input type="text" value={newUser.first_name} onChange={(e) => setNewUser({...newUser, first_name: e.target.value})} placeholder="Имя *" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
              <input type="text" value={newUser.middle_name} onChange={(e) => setNewUser({...newUser, middle_name: e.target.value})} placeholder="Отчество" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
              
              <div>
                <label className="block text-white text-sm mb-1">Группа *</label>
                <select value={newUser.group_id} onChange={(e) => setNewUser({...newUser, group_id: Number(e.target.value)})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900">
                  {groups.length === 0 ? (
                    <option value="">Нет доступных групп</option>
                  ) : (
                    groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))
                  )}
                </select>
              </div>
              
              <p className="text-xs text-white mt-2">* — обязательные поля</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptCreateUser} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white rounded-lg">Создать</button>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: Редактировать пользователя */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] bg-[#6990F5] rounded-lg shadow-xl">
            <div className="bg-[#C9D9FF] px-6 py-3"><h3 className="text-lg font-semibold">Редактирование пользователя</h3></div>
            <div className="flex gap-2 px-6 pt-4">
              <button onClick={() => setEditUserTab('userData')} className={`flex-1 py-2 border-2 border-white rounded-lg font-medium ${editUserTab === 'userData' ? 'bg-[#2860F0] text-white' : 'bg-transparent text-white'}`}>Данные пользователя</button>
              <button onClick={() => setEditUserTab('loginPassword')} className={`flex-1 py-2 border-2 border-white rounded-lg font-medium ${editUserTab === 'loginPassword' ? 'bg-[#2860F0] text-white' : 'bg-transparent text-white'}`}>Логин и пароль</button>
            </div>
            <div className="p-6 space-y-3">
              {editUserTab === 'userData' ? (
                <>
                  <input type="text" value={editUser.last_name} onChange={(e) => setEditUser({...editUser, last_name: e.target.value})} placeholder="Фамилия" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900" />
                  <input type="text" value={editUser.first_name} onChange={(e) => setEditUser({...editUser, first_name: e.target.value})} placeholder="Имя" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900" />
                  <input type="text" value={editUser.middle_name} onChange={(e) => setEditUser({...editUser, middle_name: e.target.value})} placeholder="Отчество" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900" />
                  <select value={editUser.group_id} onChange={(e) => setEditUser({...editUser, group_id: Number(e.target.value)})} className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900">
                    {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                  </select>
                </>
              ) : (
                <>
                  <input type="text" value={editUser.login} onChange={(e) => setEditUser({...editUser, login: e.target.value})} placeholder="Логин" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900" />
                  <input type="password" value={editUser.password} onChange={(e) => setEditUser({...editUser, password: e.target.value})} placeholder="Пароль (оставьте пустым, если не менять)" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900" />
                </>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptEditUser} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white rounded-lg">Сохранить</button>
              <button onClick={() => setIsEditUserModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}