// === НАСТРОЙКИ AIRTABLE (ваши данные) ===
const AIRTABLE_API_KEY = 'patFEbb4z7qC1TeNV.42f99f37994e986165f3d22d9cb294e97efdadb6fd99a682c7535fabec0e8a5f';
const AIRTABLE_BASE_ID = 'appK02xh8ZSPPfXcJ';
const AIRTABLE_TABLE_NAME = 'Objects'; // Убедитесь, что таблица называется именно так

const apiUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Элементы DOM
const container = document.getElementById('places-container');
const filterButtons = document.querySelectorAll('.filter-btn');

let allRecords = []; // все записи из Airtable

// Функция загрузки данных из Airtable
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
        // Преобразуем записи в удобный формат
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

// Функция отрисовки карточек
function renderPlaces(places) {
    if (!places.length) {
        container.innerHTML = '<div class="loader"><i class="fa-regular fa-face-frown"></i> Нет данных для отображения</div>';
        return;
    }

    const html = places.map(place => {
        // Определяем иконку в зависимости от типа
        const typeIcon = place.Type === 'Museum' ? 'fa-building-columns' : 'fa-tree';
        const typeLabel = place.Type === 'Museum' ? 'Музей' : 'Парк';

        // Изображение (если нет, ставим заглушку)
        const imageUrl = place.Image?.[0]?.url || 'https://via.placeholder.com/400x200?text=Нет+фото';

        return `
            <div class="place-card" data-type="${place.Type || ''}">
                <div class="card-image" style="background-image: url('${imageUrl}');">
                    <span class="card-type"><i class="fa-solid ${typeIcon}"></i> ${typeLabel}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${place.Name || 'Без названия'}</h3>
                    <p class="card-description">${place.Description || 'Описание отсутствует'}</p>
                    ${place.Location ? `<div class="card-location"><i class="fa-solid fa-location-dot"></i> ${place.Location}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Фильтрация по типу
function filterPlaces(type) {
    if (type === 'all') {
        renderPlaces(allRecords);
    } else {
        const filtered = allRecords.filter(place => place.Type === type);
        renderPlaces(filtered);
    }
}

// Обработчики кнопок фильтров
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterType = btn.dataset.filter;
        filterPlaces(filterType);
    });
});

// Запуск загрузки при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchAirtableData);