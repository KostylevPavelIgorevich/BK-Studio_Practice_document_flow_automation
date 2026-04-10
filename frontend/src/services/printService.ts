// src/services/printService.ts

// Загрузка HTML шаблона
export async function loadTemplate(templateName: string): Promise<string> {
    const response = await fetch(`/templates/${templateName}.html`);
    if (!response.ok) {
        throw new Error(`Шаблон ${templateName} не найден`);
    }
    return response.text();
}

// Замена плейсхолдеров {{ key }} на реальные данные
export function replacePlaceholders(template: string, data: Record<string, string>): string {
    let result = template;
    
    // Добавляем текущую дату
    const today = new Date().toLocaleDateString('ru-RU');
    result = result.replace(/{{ current_date }}/g, today);
    
    // Заменяем все плейсхолдеры
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{ ${key} }}`, 'g');
        result = result.replace(regex, value || '___________');
    }
    
    // Удаляем оставшиеся незаполненные плейсхолдеры
    result = result.replace(/{{ [a-z_]+ }}/g, '___________');
    
    return result;
}

// Печать документа
export async function printDocument(templateName: string, data: Record<string, string>): Promise<void> {
    try {
        const template = await loadTemplate(templateName);
        const html = replacePlaceholders(template, data);
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
                printWindow.onafterprint = () => printWindow.close();
            };
        }
    } catch (error) {
        console.error('Ошибка печати:', error);
        alert('Ошибка при загрузке шаблона для печати');
    }
}