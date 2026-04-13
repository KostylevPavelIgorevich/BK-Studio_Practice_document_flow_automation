// src/services/api.ts

const API_BASE_URL = 'http://127.0.0.1:8080'; 

// Получение CSRF токена
function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) {
    return meta.getAttribute('content') || '';
  }
  
  const name = 'XSRF-TOKEN';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  
  return '';
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
    headers['X-XSRF-TOKEN'] = csrfToken;
  }
  
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Ошибка ${response.status}`);
  }
  return response.json();
}

// Получение текущего пользователя из localStorage
function getCurrentUserId(): number {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || 1;
    }
  } catch (e) {
    console.error('Ошибка получения user_id:', e);
  }
  return 1; // fallback
}

// ========== CSRF ==========
export async function fetchCsrfToken(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      const meta = document.querySelector('meta[name="csrf-token"]');
      if (meta) {
        meta.setAttribute('content', data.csrf_token);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'csrf-token';
        newMeta.content = data.csrf_token;
        document.head.appendChild(newMeta);
      }
      console.log('✅ CSRF токен получен через /csrf-token');
      return;
    }
  } catch (e) {
    console.log('Не удалось получить CSRF токен через /csrf-token');
  }
  
  try {
    await fetch(`${API_BASE_URL}/test`, {
      credentials: 'include',
    });
    console.log('✅ CSRF кука установлена через fallback');
  } catch (e) {
    console.error('❌ Ошибка установки CSRF куки:', e);
  }
}

// ========== АВТОРИЗАЦИЯ ==========
export async function login(login: string, password: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ login, password }),
  });
  
  const data = await handleResponse(response);
  await fetchCsrfToken();
  return data;
}

export async function logout(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

// ========== ГРУППЫ ==========
export async function getGroups(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function createGroup(name: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function updateGroup(id: number, name: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

// ========== ПОЛЬЗОВАТЕЛИ ==========
export async function getUsers(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function createUser(userData: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function updateUser(id: number, userData: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

// ========== ТИПЫ ДОКУМЕНТОВ ==========
export async function getDocumentTypes(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/document-types`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function getDocumentTypeFields(code: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/document-types/${code}/fields`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

// ========== ДОКУМЕНТЫ ==========
export async function getDocuments(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function getDocumentById(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function createDocument(documentTypeId: number, formData: any): Promise<any> {
  let userId = 1;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user.id;
      console.log('👤 Текущий пользователь:', { id: userId, login: user.login });
    }
  } catch (e) {
    console.error('Ошибка получения user_id:', e);
  }
  
  console.log('📝 Создание документа:', { 
    documentTypeId, 
    userId, 
    formData: Object.keys(formData) 
  });
  
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      user_id: userId,
      document_type_id: documentTypeId,
      form_data: formData,
    }),
  });
  return handleResponse(response);
}

export async function updateDocument(id: number, formData: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ form_data: formData }),
  });
  return handleResponse(response);
}

export async function printDocument(id: number): Promise<{ html: string }> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/print`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

// ========== НАКЛАДНЫЕ ==========
export async function createWaybill(data: {
  application_type: string;
  waybill_type: string;
  form_type: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/waybill`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function saveWaybillData(id: number, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/waybill/${id}/save`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function printWaybill(id: number): Promise<{ html: string }> {
  const response = await fetch(`${API_BASE_URL}/waybill/${id}/print`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

// ========== НОВАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ КОНФИГУРАЦИИ НАКЛАДНОЙ ==========
// export async function getWaybillConfig(option: string, type: string, form: string) {
//   const response = await fetch(
//     `${API_BASE_URL}/waybill/config?option=${encodeURIComponent(option)}&type=${encodeURIComponent(type)}&form=${encodeURIComponent(form)}`,
//     {
//       headers: getHeaders(),
//       credentials: 'include',
//     }
//   );
//   return handleResponse(response);
// }

// ========== ФУНКЦИЯ ДЛЯ СОХРАНЕНИЯ НАКЛАДНОЙ (ОБНОВЛЁННАЯ) ==========
// export async function saveWaybill(data: {
//   user_id: number;
//   option: string;
//   type: string;
//   form: string;
//   form_data: Record<string, any>;
// }): Promise<any> {
//   const response = await fetch(`${API_BASE_URL}/waybill/save`, {
//     method: 'POST',
//     headers: getHeaders(),
//     credentials: 'include',
//     body: JSON.stringify(data),
//   });
//   return handleResponse(response);
// }

// ========== ЗАЯВКИ ДЛЯ НАКЛАДНОЙ ==========
// ========== ЗАЯВКИ ДЛЯ НАКЛАДНОЙ ==========
export async function getApplications(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function createWaybillFromApplication(data: {
  applicationId: number;
  waybillType: string;
  sendType: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/waybill/from-application`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// ========== ПОЛУЧЕНИЕ ШАБЛОНОВ ИЗ ПАПКИ TEMPLATES ==========
export async function getApplicationsFromTemplates(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/templates/applications`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function getWaybillsFromTemplates(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/templates/waybills`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function scanAllTemplates(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/templates/scan`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse(response);
}

// ========== ПРИНУДИТЕЛЬНЫЙ ВЫХОД ==========
export async function forceLogoutAndReset(): Promise<void> {
  localStorage.removeItem('user');
  try {
    await fetch(`${API_BASE_URL}/logout`, { 
      method: 'POST', 
      credentials: 'include' 
    });
  } catch (e) {
    console.log('Ошибка при выходе:', e);
  }
  await fetchCsrfToken();
}

// ========== ЭКСПОРТ ВСЕХ ФУНКЦИЙ ==========
export default {
  login,
  logout,
  fetchCsrfToken,
  getGroups,
  createGroup,
  updateGroup,
  getUsers,
  createUser,
  updateUser,
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  printDocument,
  getDocumentTypes,
  getDocumentTypeFields,
  createWaybill,
  saveWaybillData,
  printWaybill,
  getApplications,
  createWaybillFromApplication,
  getApplicationsFromTemplates,
  getWaybillsFromTemplates,
  scanAllTemplates,
  forceLogoutAndReset,
};