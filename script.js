// === НАСТРОЙКИ AIRTABLE ===
const AIRTABLE_API_KEY = 'patFEbb4z7qC1TeNV.42f99f37994e986165f3d22d9cb294e97efdadb6fd99a682c7535fabec0e8a5f';
const AIRTABLE_BASE_ID = 'appK02xh8ZSPPfXcJ';
const AIRTABLE_TABLE_NAME = 'Objects';

const apiUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// ============== СООТВЕТСТВИЕ КАТЕГОРИЙ И ИКОНОК ==============
const categoryIcons = {
    architecture: 'fa-landmark',
    food: 'fa-utensils',
    hotel: 'fa-hotel',
    museum: 'fa-building-columns',
    park: 'fa-tree'
};

const categoryNames = {
    architecture: 'Архитектура',
    food: 'Еда',
    hotel: 'Отель',
    museum: 'Музей',
    park: 'Парк'
};

// ================= ЭЛЕМЕНТЫ DOM =================
const container = document.getElementById('cards-container');
const filterButtons = document.querySelectorAll('.filter-btn');

let allRecords = []; // все записи из Airtable

// ================= ЗАГРУЗКА ДАННЫХ =================
async function fetchAirtableData() {
    try {
        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
        });

        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

        const data = await response.json();
        // Преобразуем записи в удобный формат
        allRecords = data.records.map(record => ({
            id: record.id,
            ...record.fields
        }));

        renderPlaces('all');
    } catch (error) {
        console.error('Ошибка загрузки из Airtable:', error);
        container.innerHTML = `<div class="no-results"><i class="fa-solid fa-circle-exclamation"></i> Не удалось загрузить данные. Проверьте настройки Airtable.</div>`;
    }
}

// ================= ОТРИСОВКА КАРТОЧЕК =================
function renderPlaces(filterCategory = 'all') {
    let filtered = allRecords;
    if (filterCategory !== 'all') {
        filtered = allRecords.filter(place => place.Category === filterCategory);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="no-results"><i class="fa-regular fa-face-frown"></i> Нет объектов в этой категории</div>`;
        return;
    }

    const cardsHTML = filtered.map((place, index) => {
        const category = place.Category || 'other';
        const iconClass = categoryIcons[category] || 'fa-circle-question';
        const categoryName = categoryNames[category] || category;

        // Изображение (если есть)
        let imageStyle = '';
        if (place.Image && place.Image[0] && place.Image[0].url) {
            imageStyle = `background-image: url('${place.Image[0].url}');`;
        } else {
            // Заглушка с иконкой поверх градиента
            imageStyle = `background: linear-gradient(145deg, #1e2a3a, #0f1a24);`;
        }

        // Рейтинг (если нет, ставим прочерк)
        const rating = place.Rating ? place.Rating.toFixed(1) : '—';

        // Локация (если есть)
        const locationHTML = place.Location 
            ? `<div class="card-location"><i class="fa-solid fa-location-dot"></i> ${place.Location}</div>` 
            : '';

        return `
            <div class="place-card" style="animation-delay: ${index * 0.1}s" data-category="${category}">
                <div class="card-media" style="${imageStyle}">
                    ${!place.Image ? `<i class="fa-solid ${iconClass}"></i>` : ''}
                    <span class="card-category"><i class="fa-regular fa-folder-open"></i> ${categoryName}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${place.Name || 'Без названия'}</h3>
                    <p class="card-description">${place.Description || 'Описание отсутствует'}</p>
                    ${locationHTML}
                    <div class="card-footer">
                        <span class="card-rating"><i class="fa-solid fa-star"></i> ${rating}</span>
                        <span class="card-btn">Подробнее <i class="fa-regular fa-arrow-right"></i></span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cardsHTML;
}

// ================= ОБРАБОТЧИКИ ФИЛЬТРОВ =================
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPlaces(btn.dataset.filter);
    });
});

// ================= ЭФФЕКТ СВЕЧЕНИЯ ЗА КУРСОРОМ =================
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.place-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ================= СТАРТ =================
document.addEventListener('DOMContentLoaded', fetchAirtableData);