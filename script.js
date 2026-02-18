// === НАСТРОЙКИ AIRTABLE ===
const AIRTABLE_API_KEY = 'patFEbb4z7qC1TeNV.42f99f37994e986165f3d22d9cb294e97efdadb6fd99a682c7535fabec0e8a5f';
const AIRTABLE_BASE_ID = 'appK02xh8ZSPPfXcJ';
const AIRTABLE_TABLE_NAME = 'Objects';

const apiUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Элементы DOM
const container = document.getElementById('places-container');
const filtersContainer = document.getElementById('filters-container');

let allRecords = [];
let uniqueTypes = [];

// Соответствие типа -> иконка и русская подпись
const typeConfig = {
    Museum:      { label: 'Музей',        icon: 'fa-building-columns' },
    Architecture:{ label: 'Архитектура',  icon: 'fa-archway' },
    Park:        { label: 'Парк',         icon: 'fa-tree' },
    Food:        { label: 'Еда',          icon: 'fa-utensils' },
    Hotel:       { label: 'Отель',        icon: 'fa-hotel' },
    Nature:      { label: 'Природа',      icon: 'fa-tree' },
    Uncategorized: { label: 'Без категории', icon: 'fa-tag' }
};

// Загрузка данных
async function fetchAirtableData() {
    try {
        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        
        allRecords = data.records.map(record => {
            const fields = record.fields;
            if (fields.Type) {
                fields.Type = fields.Type.trim();
            } else {
                fields.Type = null;
            }
            return { id: record.id, ...fields };
        });

        console.log('Данные из Airtable:', allRecords);

        const typesSet = new Set();
        allRecords.forEach(item => {
            if (item.Type) typesSet.add(item.Type);
        });
        const hasUntyped = allRecords.some(item => !item.Type);
        if (hasUntyped) typesSet.add('Uncategorized');
        
        uniqueTypes = Array.from(typesSet).sort();

        renderFilterButtons();
        renderPlaces(allRecords);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        container.innerHTML = `<div class="loader" style="color: #b91c1c;">
            <i class="fa-solid fa-circle-exclamation"></i> Ошибка загрузки. Проверьте консоль.
        </div>`;
    }
}

// Создание кнопок фильтров
function renderFilterButtons() {
    let buttonsHtml = `<button class="filter-btn active" data-filter="all">Все</button>`;

    uniqueTypes.forEach(type => {
        const config = typeConfig[type] || { label: type, icon: 'fa-map-pin' };
        buttonsHtml += `
            <button class="filter-btn" data-filter="${type}">
                <i class="fa-solid ${config.icon}"></i> ${config.label}
            </button>
        `;
    });

    filtersContainer.innerHTML = buttonsHtml;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterType = btn.dataset.filter;
            if (filterType === 'all') {
                renderPlaces(allRecords);
            } else if (filterType === 'Uncategorized') {
                const filtered = allRecords.filter(item => !item.Type);
                renderPlaces(filtered);
            } else {
                const filtered = allRecords.filter(item => item.Type === filterType);
                renderPlaces(filtered);
            }
        });
    });
}

// Отрисовка карточек
function renderPlaces(places) {
    if (!places.length) {
        container.innerHTML = '<div class="loader"><i class="fa-regular fa-face-frown"></i> Нет данных</div>';
        return;
    }

    const html = places.map(place => {
        const rawType = place.Type ? place.Type.trim() : null;
        const type = rawType || 'Uncategorized';
        const config = typeConfig[type] || { label: type, icon: 'fa-map-pin' };
        
        // Фото (поле Photo, тип Attachment)
        const imageUrl = place.Photo?.[0]?.url || 'https://via.placeholder.com/400x200?text=Каракол';

        // Ссылка на карту (поле Maps_Link)
        const mapLink = place.Maps_Link || '';

        return `
            <div class="place-card" data-type="${type}">
                <div class="card-image" style="background-image: url('${imageUrl}');">
                    <span class="card-type"><i class="fa-solid ${config.icon}"></i> ${config.label}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${place.Name || 'Без названия'}</h3>
                    <p class="card-description">${place.Description || 'Описание отсутствует'}</p>
                    ${mapLink ? 
                        `<a href="${mapLink}" target="_blank" class="route-link">
                            <i class="fa-solid fa-map-location-dot"></i> Проложить путь
                        </a>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Старт
document.addEventListener('DOMContentLoaded', fetchAirtableData);