// === НАСТРОЙКИ AIRTABLE ===
const AIRTABLE_API_KEY = 'patFEbb4z7qC1TeNV.42f99f37994e986165f3d22d9cb294e97efdadb6fd99a682c7535fabec0e8a5f';
const AIRTABLE_BASE_ID = 'appK02xh8ZSPPfXcJ';
const AIRTABLE_TABLE_NAME = 'Objects'; // Имя вашей таблицы

const apiUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Элементы DOM
const container = document.getElementById('places-container');
const filterButtons = document.querySelectorAll('.filter-btn');

let allRecords = []; // все записи из Airtable

// Соответствие типа и русскоязычной подписи / иконки
const typeConfig = {
    Museum: { label: 'Музей', icon: 'fa-building-columns' },
    Nature: { label: 'Природа', icon: 'fa-tree' },
    Architecture: { label: 'Архитектура', icon: 'fa-archway' }
};

// Загрузка данных
async function fetchAirtableData() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        // Преобразуем записи
        allRecords = data.records.map(record => ({
            id: record.id,
            ...record.fields
        }));

        renderPlaces(allRecords);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        container.innerHTML = `<div class="loader" style="color: #b91c1c;"><i class="fa-solid fa-circle-exclamation"></i> Ошибка загрузки данных. Проверьте консоль и настройки Airtable.</div>`;
    }
}

// Отрисовка карточек
function renderPlaces(places) {
    if (!places.length) {
        container.innerHTML = '<div class="loader"><i class="fa-regular fa-face-frown"></i> Нет данных для отображения</div>';
        return;
    }

    const html = places.map(place => {
        const type = place.Type || 'Другое';
        const config = typeConfig[type] || { label: type, icon: 'fa-circle-question' };
        const typeIcon = config.icon;
        const typeLabel = config.label;

        // Если есть изображение (поле Image типа Attachment), подставляем его. Пока заглушка.
        const imageUrl = place.Image?.[0]?.url || 'https://via.placeholder.com/400x200?text=Каракол';

        return `
            <div class="place-card" data-type="${type}">
                <div class="card-image" style="background-image: url('${imageUrl}');">
                    <span class="card-type"><i class="fa-solid ${typeIcon}"></i> ${typeLabel}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${place.Name || 'Без названия'}</h3>
                    <p class="card-description">${place.Description || 'Описание отсутствует'}</p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Фильтрация
function filterPlaces(type) {
    if (type === 'all') {
        renderPlaces(allRecords);
    } else {
        const filtered = allRecords.filter(place => place.Type === type);
        renderPlaces(filtered);
    }
}

// Обработчики фильтров
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterPlaces(btn.dataset.filter);
    });
});

// Старт
document.addEventListener('DOMContentLoaded', fetchAirtableData);