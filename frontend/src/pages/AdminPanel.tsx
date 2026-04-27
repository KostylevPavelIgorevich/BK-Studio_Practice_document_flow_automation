import { useState, useEffect } from 'react';
import { Documents } from './Documents';
import { getGroups, createGroup, updateGroup, getUsers, createUser, updateUser } from '../services/api';
import sortIcon from '../assets/стрелки сортировка.png';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [groupSearch, setGroupSearch] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [sortGroupsAsc, setSortGroupsAsc] = useState(true);

  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [sortUsersAsc, setSortUsersAsc] = useState(true);

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

  // Состояние для выбранной группы и её пользователей (без модального окна)
  const [selectedGroupForUsers, setSelectedGroupForUsers] = useState<any>(null);
  const [groupUsersList, setGroupUsersList] = useState<any[]>([]);

  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
      if (data.length > 0) setNewUser(prev => ({ ...prev, group_id: data[0].id }));
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

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()));
  const filteredUsers = users.filter(u => `${u.last_name} ${u.first_name} ${u.middle_name}`.toLowerCase().includes(userSearch.toLowerCase()));

  const sortedGroups = [...filteredGroups].sort((a, b) => sortGroupsAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const nameA = `${a.last_name} ${a.first_name} ${a.middle_name}`;
    const nameB = `${b.last_name} ${b.first_name} ${b.middle_name}`;
    return sortUsersAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  
  const validateGroupName = (name: string): string | null => {
    if (!name.trim()) return 'Название группы не может быть пустым';
    if (!/^[а-яА-Яa-zA-Z0-9\s\-]+$/.test(name)) {
      return 'Название группы может содержать только буквы, цифры, дефис и пробелы';
    }
    return null;
  };

  const validateLogin = (login: string): string | null => {
    if (!login.trim()) return 'Логин не может быть пустым';
    if (!/^[a-zA-Z0-9\-_]+$/.test(login)) {
      return 'Логин может содержать только латинские буквы, цифры, дефис и подчёркивание';
    }
    return null;
  };

  const validateNameField = (value: string, fieldName: string): string | null => {
    if (!value.trim()) return `${fieldName} не может быть пустым`;
    if (!/^[а-яА-Яa-zA-Z\s\-]+$/.test(value)) {
      return `${fieldName} может содержать только буквы, дефис и пробелы`;
    }
    return null;
  };

 
  const handleCreateGroup = () => { setNewGroupName(''); setIsCreateGroupModalOpen(true); };
 const handleAcceptCreateGroup = async () => {
  const error = validateGroupName(newGroupName);
  if (error) { alert(error); return; }
  try {
    await createGroup(newGroupName.trim());
    await loadGroups();
    setIsCreateGroupModalOpen(false);
    setNewGroupName('');
  } catch (err: any) {
    console.error(err);
    if (err.errors?.name) {
      alert(err.errors.name[0]);
    } else if (err.message) {
      alert(err.message);
    } else {
      alert('Ошибка при создании группы');
    }
  }
};

  const handleSelectGroup = (id: number) => setSelectedGroupId(id);
  const handleEditGroup = () => {
    if (selectedGroupId === null) return alert('Сначала выберите группу');
    const group = groups.find(g => g.id === selectedGroupId);
    if (group) { setEditGroupName(group.name); setIsEditGroupModalOpen(true); }
  };
  const handleAcceptEditGroup = async () => {
    if (selectedGroupId === null) return;
    const error = validateGroupName(editGroupName);
    if (error) { alert(error); return; }
    try {
      await updateGroup(selectedGroupId, editGroupName.trim());
      await loadGroups();
      setIsEditGroupModalOpen(false);
      setEditGroupName('');
      setSelectedGroupId(null);
    } catch (error) { alert('Ошибка при изменении группы'); }
  };


  const handleGroupDoubleClick = (group: any) => {
    const usersInGroup = users.filter(u => u.group_id === group.id);
    setSelectedGroupForUsers(group);
    setGroupUsersList(usersInGroup);
  };


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
  const loginError = validateLogin(newUser.login);
  if (loginError) { alert(loginError); return; }
  const lastNameError = validateNameField(newUser.last_name, 'Фамилия');
  if (lastNameError) { alert(lastNameError); return; }
  const firstNameError = validateNameField(newUser.first_name, 'Имя');
  if (firstNameError) { alert(firstNameError); return; }
  if (newUser.middle_name && !/^[а-яА-Яa-zA-Z\s\-]+$/.test(newUser.middle_name)) {
    alert('Отчество может содержать только буквы, дефис и пробелы');
    return;
  }
  if (!newUser.password.trim()) { alert('Введите пароль'); return; }
  if (!newUser.group_id) { alert('Выберите группу'); return; }

  try {
    await createUser(newUser);
    await loadUsers();
    setIsCreateUserModalOpen(false);
    setNewUser({ login: '', password: '', last_name: '', first_name: '', middle_name: '', role_id: 2, group_id: groups[0]?.id || 1 });
    alert('Пользователь создан');
  } catch (err: any) {
    console.error(err);
    if (err.errors?.login) {
      alert(err.errors.login[0]);
    } else if (err.message) {
      alert(err.message);
    } else {
      alert('Ошибка создания');
    }
  }
};

  const handleSelectUserForEdit = (id: number) => setSelectedUserIdForEdit(id);
  const handleEditUser = () => {
    if (selectedUserIdForEdit === null) return alert('Выберите пользователя');
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
  };
  const handleAcceptEditUser = async () => {
    if (!editUser.id) return;
    const loginError = validateLogin(editUser.login);
    if (loginError) { alert(loginError); return; }
    const lastNameError = validateNameField(editUser.last_name, 'Фамилия');
    if (lastNameError) { alert(lastNameError); return; }
    const firstNameError = validateNameField(editUser.first_name, 'Имя');
    if (firstNameError) { alert(firstNameError); return; }
    if (editUser.middle_name && !/^[а-яА-Яa-zA-Z\s\-]+$/.test(editUser.middle_name)) {
      alert('Отчество может содержать только буквы, дефис и пробелы');
      return;
    }
    try {
      const updateData = { ...editUser };
      if (!updateData.password || updateData.password.trim() === '') delete (updateData as any).password;
      await updateUser(editUser.id, updateData);
      await loadUsers();
      setIsEditUserModalOpen(false);
      setSelectedUserIdForEdit(null);
      alert('Пользователь обновлён');
    } catch (error: any) { alert(error.message || 'Ошибка обновления'); }
  };


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
      <div className="flex gap-6 p-6">
        {/* ЛЕВАЯ ПАНЕЛЬ - Группы */}
        <div className="w-1/4 space-y-4">
          <div className="flex gap-3">
            <button onClick={handleCreateGroup} className="flex-1 py-2 bg-[#7C5CFC] hover:bg-[#6a48e8] text-white font-medium rounded-lg">Создать группу</button>
            <button onClick={handleEditGroup} className="flex-1 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg">Изменить группу</button>
          </div>
          <input type="text" placeholder="Поиск групп..." value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" />
          
          <div className="rounded-lg px-4 py-2" style={{ backgroundColor: '#E4E0FF', border: '1.5px solid #7C5CFC' }}>
            <div className="flex items-center justify-between font-semibold text-gray-800">
              <span>Группы учащихся</span>
              <button onClick={() => setSortGroupsAsc(!sortGroupsAsc)} className="focus:outline-none">
                <img src={sortIcon} alt="Сортировка" style={{ width: '20px', height: '15px' }} />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md max-h-[400px] overflow-y-auto">
            {sortedGroups.map((group) => (
              <div
                key={group.id}
                className={`px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedGroupId === group.id ? 'bg-blue-100 border-l-4 border-[#2860F0]' : ''}`}
                onClick={() => handleSelectGroup(group.id)}
                onDoubleClick={() => handleGroupDoubleClick(group)}
              >
                <span className="text-gray-700">{group.name}</span>
              </div>
            ))}
          </div>

          {/* Блок с пользователями выбранной группы (вместо модального окна) */}
          {selectedGroupForUsers && (
            <div className="mt-4 p-3 bg-white rounded-lg shadow-md">
              <h4 className="font-semibold text-[#7C5CFC] mb-2 text-center">
                Пользователи группы "{selectedGroupForUsers.name}"
              </h4>
              {groupUsersList.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">Нет пользователей</p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {groupUsersList.map(user => (
                    <div key={user.id} className="border-b border-gray-100 py-2 px-2 hover:bg-gray-50">
                      <div className="text-sm text-gray-700">
                        {user.last_name} {user.first_name} {user.middle_name || ''}
                      </div>
                      <div className="text-xs text-gray-500">Логин: {user.login}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 text-center">Список всех групп</p>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ - Пользователи */}
        <div className="w-3/4 space-y-4">
          <div className="flex gap-3">
            <button onClick={handleCreateUser} className="px-6 py-3 flex-1 bg-[#7C5CFC] hover:bg-[#6a48e8] text-white font-medium rounded-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Создать пользователя
            </button>
            <button onClick={handleEditUser} className="px-6 py-3 flex-1 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Редактирование пользователя
            </button>
            <button onClick={onLogout} className="px-6 py-3 flex-1 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Выход
            </button>
          </div>

          <input type="text" placeholder="Поиск пользователей..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" />
          
          <div className="grid grid-cols-3 gap-4 rounded-lg px-4 py-2" style={{ backgroundColor: '#E4E0FF', border: '1.5px solid #7C5CFC' }}>
            <div className="flex items-center justify-between font-semibold text-gray-800">
              <span>Фамилия</span>
              <button onClick={() => setSortUsersAsc(!sortUsersAsc)} className="focus:outline-none">
                <img src={sortIcon} alt="Сортировка" style={{ width: '20px', height: '15px' }} />
              </button>
            </div>
            <div className="font-semibold text-gray-800">Имя</div>
            <div className="font-semibold text-gray-800">Отчество</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md max-h-[400px] overflow-y-auto">
            {sortedUsers.map((user) => {
              const fullName = `${user.last_name} ${user.first_name} ${user.middle_name}`;
              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-3 gap-4 px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedUserIdForEdit === user.id ? 'bg-blue-100 border-l-4 border-[#2860F0]' : ''}`}
                  onClick={() => handleSelectUserForEdit(user.id)}
                  onDoubleClick={() => handleDoubleClickUser(user.id, fullName)}
                >
                  <span className="text-gray-700">{user.last_name}</span>
                  <span className="text-gray-700">{user.first_name}</span>
                  <span className="text-gray-700">{user.middle_name || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Модальные окна (без изменений) */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[400px] rounded-2xl shadow-xl overflow-hidden border border-white" style={{ backgroundColor: '#8778C3' }}>
            <div className="px-6 py-3 text-center" style={{ backgroundColor: '#E4E0FF' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#7C5CFC' }}>Создать группу</h3>
            </div>
            <div className="p-6">
              <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Введите название группы" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" autoFocus />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptCreateGroup} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white rounded-lg border border-white">Принять</button>
              <button onClick={() => setIsCreateGroupModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg border border-white">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {isEditGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[400px] rounded-2xl shadow-xl overflow-hidden border border-white" style={{ backgroundColor: '#6990F5' }}>
            <div className="px-6 py-3 text-center" style={{ backgroundColor: '#C9D9FF' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#2860F0' }}>Изменить группу</h3>
            </div>
            <div className="p-6">
              <input type="text" value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} placeholder="Новое название группы" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptEditGroup} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white rounded-lg border border-white">Сохранить</button>
              <button onClick={() => setIsEditGroupModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg border border-white">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] rounded-2xl shadow-xl overflow-hidden border border-white" style={{ backgroundColor: '#8778C3' }}>
            <div className="px-6 py-3 text-center" style={{ backgroundColor: '#E4E0FF' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#7C5CFC' }}>Создать пользователя</h3>
            </div>
            <div className="p-6 space-y-3">
             <input 
  type="text" 
  value={newUser.login} 
  onChange={(e) => setNewUser({...newUser, login: e.target.value})} 
  placeholder="Логин *" 
  autoComplete="off"
  className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" 
/>
<input 
  type="password" 
  value={newUser.password} 
  onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
  placeholder="Пароль *" 
  autoComplete="new-password"
  className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" 
/>
              <input type="text" value={newUser.last_name} onChange={(e) => setNewUser({...newUser, last_name: e.target.value})} placeholder="Фамилия *" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
              <input type="text" value={newUser.first_name} onChange={(e) => setNewUser({...newUser, first_name: e.target.value})} placeholder="Имя *" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
              <input type="text" value={newUser.middle_name} onChange={(e) => setNewUser({...newUser, middle_name: e.target.value})} placeholder="Отчество" className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
              <div>
                <label className="block text-white text-sm mb-1">Группа *</label>
                <select value={newUser.group_id} onChange={(e) => setNewUser({...newUser, group_id: Number(e.target.value)})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900">
                  {groups.length === 0 ? <option>Нет доступных групп</option> : groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                </select>
              </div>
              <p className="text-xs text-white mt-2">* — обязательные поля</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptCreateUser} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white rounded-lg border border-white">Создать</button>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg border border-white">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {isEditUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] rounded-2xl shadow-xl overflow-hidden border border-white" style={{ backgroundColor: '#6990F5' }}>
            <div className="px-6 py-3 text-center" style={{ backgroundColor: '#C9D9FF' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#2860F0' }}>Редактирование пользователя</h3>
            </div>
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
                  <input type="password" value={editUser.password} onChange={(e) => setEditUser({...editUser, password: e.target.value})} placeholder="Пароль по умолчанию" className="w-full px-4 py-2 bg-[#C9D9FF] border border-[#919191] rounded-lg text-gray-900" />
                </>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleAcceptEditUser} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white rounded-lg border border-white">Сохранить</button>
              <button onClick={() => setIsEditUserModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white rounded-lg border border-white">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}