const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const navLinkAnchors = document.querySelectorAll('.nav-links a');
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const galleryGrid = document.getElementById('galleryGrid');
const uploadButton = document.getElementById('uploadButton');
const photoUpload = document.getElementById('photoUpload');
const modal = document.getElementById('galleryModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const photoName = document.getElementById('photoName');
const photoDescription = document.getElementById('photoDescription');
const saveDescriptionButton = document.getElementById('saveDescriptionButton');
const deletePhotoButton = document.getElementById('deletePhotoButton');
const closeModal = document.querySelector('.close-modal');
const loginButton = document.getElementById('loginButton');
const journalForm = document.getElementById('journalForm');
const journalGrid = document.getElementById('journalGrid');
const journalSubmitButton = document.getElementById('saveJournalButton');
let activePhotoSrc = null;
let editingJournalId = null;

function generateId() {
    return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeLocalStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // ignore storage errors
    }
}

function getStoredJournalEntries() {
    try {
        return JSON.parse(safeLocalStorageGet(getStorageKey('journalEntries')) || '[]');
    } catch {
        return [];
    }
}

function getStoredPhotos() {
    try {
        return JSON.parse(safeLocalStorageGet(getStorageKey('importedPhotos')) || '[]');
    } catch {
        return [];
    }
}
const previewFields = {
    entryDay: document.getElementById('preview-day'),
    entryLocation: document.getElementById('preview-location'),
    entryMood: document.getElementById('preview-mood'),
    entryHighlight: document.getElementById('preview-highlight'),
    entryWeather: document.getElementById('preview-weather'),
    entryNote: document.getElementById('preview-note'),
};
const destinationOptions = [
    { id: 'dest-1', name: 'Neuschwanstein' },
    { id: 'dest-2', name: 'Salzburg' },
    { id: 'dest-3', name: 'Hallstatt' },
    { id: 'dest-4', name: 'Bled' },
    { id: 'dest-5', name: 'Plitvice' },
    { id: 'dest-6', name: 'Split' },
    { id: 'dest-7', name: 'Korcula' },
    { id: 'dest-8', name: 'Mljet' },
    { id: 'dest-9', name: 'Dubrovnik' },
    { id: 'dest-10', name: 'Ferry' },
    { id: 'dest-11', name: 'Bologna' },
    { id: 'dest-12', name: 'Torino' },
];

const mapDestinations = {
    'dest-1': { name: 'Neuschwanstein', coord: [47.5576, 10.7498], popup: 'Fairytale castle in Bavaria' },
    'dest-2': { name: 'Salzburg', coord: [47.8095, 13.0550], popup: 'Mozart city and alpine charm' },
    'dest-3': { name: 'Hallstatt', coord: [47.5615, 13.6475], popup: 'Lakefront village and salt mines' },
    'dest-4': { name: 'Bled', coord: [46.3625, 14.0937], popup: 'Lake Bled and castle views' },
    'dest-5': { name: 'Plitvice', coord: [44.8805, 15.6160], popup: 'Waterfall trails in Croatia' },
    'dest-6': { name: 'Split', coord: [43.5081, 16.4402], popup: 'Ancient coastal city' },
    'dest-7': { name: 'Korcula', coord: [42.9600, 17.1258], popup: 'Historic island escape' },
    'dest-8': { name: 'Mljet', coord: [42.7411, 17.6724], popup: 'National park island' },
    'dest-9': { name: 'Dubrovnik', coord: [42.6507, 18.0944], popup: 'Ancient city with sea views' },
    'dest-10': { name: 'Ferry', coord: [43.6158, 13.5189], popup: 'Adriatic ferry route' },
    'dest-11': { name: 'Bologna', coord: [44.4949, 11.3426], popup: 'Italian food capital' },
    'dest-12': { name: 'Torino', coord: [45.0703, 7.6869], popup: 'Final alpine city' },
};

const weatherCodeDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Heavy rain showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
};

const destinationWeatherCoords = {
    'dest-1': [47.5576, 10.7498],
    'dest-2': [47.8095, 13.0550],
    'dest-3': [47.5615, 13.6475],
    'dest-4': [46.3625, 14.0937],
    'dest-5': [44.8805, 15.6160],
    'dest-6': [43.5081, 16.4402],
    'dest-7': [42.9600, 17.1258],
    'dest-8': [42.7411, 17.6724],
    'dest-9': [42.6507, 18.0944],
    'dest-10': [43.6158, 13.5189],
    'dest-11': [44.4949, 11.3426],
    'dest-12': [45.0703, 7.6869],
};

const routeWeatherCoords = getRouteCenterCoords();

const TRIP_START_DATE = new Date('2026-07-30T00:00:00');
const TRIP_DURATION_DAYS = 17;
const TRIP_END_DATE = new Date(TRIP_START_DATE.getTime() + TRIP_DURATION_DAYS * 24 * 60 * 60 * 1000);

let routeMap;
let routeMarkers = {};
let routePolyline;

// Moving car along route
let carMarker = null;
let routeAnimationRafId = null;
let routeAnimationStartTime = null;
let isRouteAnimationRunning = false;
let isRouteAnimationPaused = false;
let sampledRoutePoints = []; // [{lat, lng}...]


function getRouteCenterCoords() {
    const coords = Object.values(mapDestinations).map((stop) => stop.coord);
    const total = coords.reduce(
        (acc, [lat, lon]) => ({ lat: acc.lat + lat, lon: acc.lon + lon }),
        { lat: 0, lon: 0 }
    );
    return [total.lat / coords.length, total.lon / coords.length];
}

function initRouteMap() {
    const defaultCenter = [46.7, 13.2];
    routeMap = L.map('routeMap', { zoomControl: true, attributionControl: false }).setView(defaultCenter, 5.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 3,
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(routeMap);

    const latlngs = [];
    Object.entries(mapDestinations).forEach(([destinationId, stop]) => {
        const marker = L.circleMarker(stop.coord, {
            radius: 8,
            fillColor: '#2f855a',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 1,
        }).addTo(routeMap);
        marker.bindPopup(`<strong>${stop.name}</strong><br>${stop.popup}`);
        marker.on('click', () => flyToDestination(destinationId));
        routeMarkers[destinationId] = marker;
        latlngs.push(stop.coord);
    });

    routePolyline = L.polyline(latlngs, { color: '#2f855a', weight: 5, opacity: 0.7, smoothFactor: 1 }).addTo(routeMap);
    routeMap.fitBounds(routePolyline.getBounds().pad(0.15));

    // Setup moving car on the route
    setupRouteCar();
}


function flyToDestination(destinationId) {
    const destination = mapDestinations[destinationId];
    if (!routeMap || !destination) return;
    routeMap.flyTo(destination.coord, 10, { duration: 1.5 });
    const marker = routeMarkers[destinationId];
    if (marker) {
        marker.openPopup();
    }
    highlightDestinationCard(destinationId);
}

async function fetchWeatherForCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto`);
        const data = await response.json();
        if (data && data.current_weather) {
            const code = data.current_weather.weathercode;
            return {
                temperature: Number(data.current_weather.temperature).toFixed(1),
                windspeed: Number(data.current_weather.windspeed).toFixed(1),
                description: weatherCodeDescriptions[code] || 'Current weather',
            };
        }
    } catch (error) {
        // ignore individual weather fetch errors
    }
    return null;
}

function populateDestinationWeather() {
    document.querySelectorAll('.destination-card[data-destination-id]').forEach(async (card) => {
        const id = card.dataset.destinationId;
        let weatherEl = card.querySelector('.destination-weather');
        if (!weatherEl) {
            weatherEl = document.createElement('div');
            weatherEl.className = 'destination-weather';
            const hr = card.querySelector('hr');
            if (hr) {
                hr.insertAdjacentElement('afterend', weatherEl);
            } else {
                card.querySelector('.card-content').appendChild(weatherEl);
            }
        }
        weatherEl.textContent = 'Loading weather...';
        const coords = destinationWeatherCoords[id];
        if (!coords) {
            weatherEl.textContent = 'Weather unavailable';
            return;
        }
        const weatherData = await fetchWeatherForCoords(coords[0], coords[1]);
        if (weatherData) {
            weatherEl.textContent = `${weatherData.temperature}°C · ${weatherData.description} · ${weatherData.windspeed} km/h`;
        } else {
            weatherEl.textContent = 'Weather unavailable';
        }
    });
}

function setupScrollSpyNav() {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));

    function updateActiveLink() {
        const offset = 120;
        const activeCandidates = sections
            .map((section) => ({
                section,
                rect: section.getBoundingClientRect(),
            }))
            .filter(({ rect }) => rect.top <= offset && rect.bottom > offset);

        const currentSection = activeCandidates.length
            ? activeCandidates.reduce((best, candidate) => (candidate.rect.top > best.rect.top ? candidate : best)).section
            : sections.find((section) => section.getBoundingClientRect().top > offset) || sections[sections.length - 1];

        if (!currentSection) return;
        navAnchors.forEach((link) => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[href="#${currentSection.id}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    window.addEventListener('resize', updateActiveLink);
    updateActiveLink();

    navLinkAnchors.forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });
}

function highlightDestinationCard(destinationId) {
    const previous = document.querySelector('.destination-card.active-map-highlight');
    if (previous) {
        previous.classList.remove('active-map-highlight');
    }
    const target = document.querySelector(`.destination-card[data-destination-id="${destinationId}"]`);
    if (target) {
        target.classList.add('active-map-highlight');
        setTimeout(() => target.classList.remove('active-map-highlight'), 2000);
    }
}

function getDestinationName(destinationId) {
    return destinationOptions.find((option) => option.id === destinationId)?.name || 'No destination';
}

function buildDestinationOptions(selectedId = '') {
    return [`<option value="">No destination</option>`,
        ...destinationOptions.map((option) => `
            <option value="${option.id}" ${option.id === selectedId ? 'selected' : ''}>${option.name}</option>
        `),
    ].join('');
}

const sections = document.querySelectorAll('.section-animate');

const savedTheme = localStorage.getItem('roadtrip-theme');
if (savedTheme === 'dark') {
    body.classList.add('dark');
}

function getCurrentUser() {
    return localStorage.getItem('roadtrip-user') || 'guest';
}

function getStorageKey(base) {
    const user = getCurrentUser();
    return user === 'guest' ? base : `${base}:${user}`;
}

function migrateGuestStorageToAccount() {
    const user = getCurrentUser();
    if (user === 'guest') return;

    const guestPhotos = JSON.parse(localStorage.getItem('importedPhotos') || '[]');
    const guestJournals = JSON.parse(localStorage.getItem('journalEntries') || '[]');

    if (guestPhotos.length) {
        const accountPhotos = getStoredPhotos();
        const mergedPhotos = [
            ...guestPhotos.filter((guestPhoto) => !accountPhotos.some((accountPhoto) => accountPhoto.src === guestPhoto.src)),
            ...accountPhotos,
        ];
        safeLocalStorageSet(getStorageKey('importedPhotos'), JSON.stringify(mergedPhotos));
    }

    if (guestJournals.length) {
        const accountJournals = getStoredJournalEntries();
        const mergedJournals = [
            ...guestJournals.filter((guestEntry) => !accountJournals.some((accountEntry) => accountEntry.id === guestEntry.id)),
            ...accountJournals,
        ];
        safeLocalStorageSet(getStorageKey('journalEntries'), JSON.stringify(mergedJournals));
    }
}

function updateLoginButton() {
    if (!loginButton) return;
    const user = getCurrentUser();
    loginButton.textContent = user === 'guest' ? 'Sign in' : `Signed in as ${user}`;
}

updateLoginButton();

function updateThemeIcon() {
    themeToggle.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
}

updateThemeIcon();

burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.classList.toggle('active');
});

themeToggle.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark');
    localStorage.setItem('roadtrip-theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
});

galleryGrid.addEventListener('click', (event) => {
    const target = event.target.nodeType === Node.ELEMENT_NODE ? event.target : event.target.parentElement;
    const item = target.closest('.gallery-item');
    if (!item) return;

    const deleteButton = target.closest('.gallery-delete');
    const captionAction = target.closest('.caption-action');
    const src = item.dataset.src;
    const caption = item.dataset.caption;
    const title = item.dataset.title;

    if (deleteButton) {
        event.preventDefault();
        event.stopPropagation();
        deletePhotoBySrc(src);
        return;
    }

    if (captionAction) {
        event.preventDefault();
        event.stopPropagation();
        openGalleryModal(src, caption, title);
        return;
    }

    openGalleryModal(src, caption, title);
});

function openGalleryModal(src, caption, title) {
    activePhotoSrc = src;
    modalImage.src = src;
    modalImage.alt = title || caption;
    modalCaption.textContent = title || caption || 'Photo details';
    photoName.value = title || caption || '';
    photoDescription.value = caption || '';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function openPhotoPicker() {
    if (photoUpload) {
        photoUpload.click();
    }
}

uploadButton.addEventListener('click', openPhotoPicker);

photoUpload.addEventListener('change', (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    const storedPhotos = getStoredPhotos();
    const readers = files.map((file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const filename = file.name.replace(/\.[^/.]+$/, '');
                const photo = {
                    src: reader.result,
                    title: filename,
                    caption: '',
                };
                storedPhotos.unshift(photo);
                createGalleryItem(photo);
                resolve(photo);
            };
            reader.readAsDataURL(file);
        });
    });

    Promise.all(readers).then(() => {
        const savedPhotos = storedPhotos.slice(0, 50);
        safeLocalStorageSet(getStorageKey('importedPhotos'), JSON.stringify(savedPhotos));
        photoUpload.value = '';
        updateDashboardStats();
    });
});

saveDescriptionButton.addEventListener('click', () => {
    if (!activePhotoSrc) return;
    const title = photoName.value.trim();
    const description = photoDescription.value.trim();
    const photos = getStoredPhotos();
    const updated = photos.map((photo) => {
        if (photo.src === activePhotoSrc) {
            return {
                ...photo,
                title: title || photo.title || photo.caption,
                caption: description || photo.caption,
            };
        }
        return photo;
    });
    safeLocalStorageSet(getStorageKey('importedPhotos'), JSON.stringify(updated));

    const galleryItem = galleryGrid.querySelector(`[data-src="${activePhotoSrc}"]`);
    let updatedTitle = title;
    if (galleryItem) {
        galleryItem.dataset.caption = description || galleryItem.dataset.caption;
        galleryItem.dataset.title = title || galleryItem.dataset.title || galleryItem.dataset.caption;
        updatedTitle = galleryItem.dataset.title;
        const captionText = galleryItem.querySelector('.gallery-caption');
        if (captionText) {
            captionText.textContent = updatedTitle;
        }
    }
    modalCaption.textContent = updatedTitle || modalCaption.textContent;
    closeGallery();
});

deletePhotoButton.addEventListener('click', () => {
    if (!activePhotoSrc) return;
    deletePhotoBySrc(activePhotoSrc);
    closeGallery();
});

function deletePhotoBySrc(src) {
    const photos = getStoredPhotos();
    const filtered = photos.filter((photo) => photo.src !== src);
    safeLocalStorageSet(getStorageKey('importedPhotos'), JSON.stringify(filtered));
    const galleryItem = galleryGrid.querySelector(`[data-src="${src}"]`);
    if (galleryItem) {
        galleryItem.remove();
    }
    if (filtered.length === 0) {
        createGalleryPlaceholder();
    }
    updateDashboardStats();
}

function closeGallery() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

closeModal.addEventListener('click', closeGallery);
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeGallery();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeGallery();
    }
});

function updatePreview() {
    const formData = new FormData(journalForm);
    previewFields.entryDay.textContent = formData.get('entryDay') || 'Day 1';
    previewFields.entryLocation.textContent = formData.get('entryLocation') || 'Bavaria';
    previewFields.entryMood.textContent = formData.get('entryMood') || 'Excited';
    previewFields.entryHighlight.textContent = formData.get('entryHighlight') || 'Castle sunset';
    previewFields.entryWeather.textContent = formData.get('entryWeather') || 'Sunny';
    previewFields.entryNote.textContent = formData.get('entryNote') || 'The first view of the castle felt like stepping into a storybook.';
}

function createJournalEntry(entry, index = 0) {
    entry.id = entry.id || generateId();
    const article = document.createElement('article');
    article.className = 'journal-entry';
    article.dataset.id = entry.id;
    article.dataset.linkedDestination = entry.destinationId || '';
    article.innerHTML = `
        <div class="journal-entry-top">
            <div>
                <span class="entry-date">${entry.day}</span>
                <h3>${entry.location}</h3>
            </div>
            <div class="journal-entry-actions">
                <button type="button" class="journal-entry-action" data-action="edit">Edit</button>
                <button type="button" class="journal-entry-action journal-delete-entry" data-action="delete">Delete</button>
            </div>
        </div>
        <div class="journal-entry-meta">
            <span>${entry.mood || 'Mood unknown'}</span>
            <span>${entry.weather || 'Weather unknown'}</span>
        </div>
        <p>${entry.note}</p>
        <div class="journal-entry-link">
            <div class="journal-entry-link-controls">
                <button type="button" class="destination-link-button">Open destination</button>
                <small class="entry-linked-destination">${entry.destinationId ? getDestinationName(entry.destinationId) : 'No destination selected'}</small>
            </div>
        </div>
        <div class="journal-entry-highlight">Highlight: ${entry.highlight || 'No highlight yet'}</div>
    `;
    article.style.animationDelay = `${index * 80}ms`;
    journalGrid.prepend(article);
    requestAnimationFrame(() => article.classList.add('visible'));
}

function loadJournalEntries() {
    journalGrid.innerHTML = '';
    const entries = getStoredJournalEntries();
    let updated = false;
    entries.forEach((entry) => {
        if (!entry.id) {
            entry.id = generateId();
            updated = true;
        }
    });
    if (updated) {
        saveJournalEntries(entries);
    }
    entries.forEach((entry, index) => createJournalEntry(entry, index));
    updateDashboardStats();
}

function saveJournalEntries(entries) {
    safeLocalStorageSet(getStorageKey('journalEntries'), JSON.stringify(entries));
}

function updateDashboardStats() {
    const entries = getStoredJournalEntries().length;
    const photos = getStoredPhotos().length;
    const entryCountEl = document.getElementById('entryCount');
    const photoCountEl = document.getElementById('photoCount');

    if (entryCountEl) {
        entryCountEl.dataset.target = entries;
        entryCountEl.textContent = entries;
    }
    if (photoCountEl) {
        photoCountEl.dataset.target = photos;
        photoCountEl.textContent = photos;
    }
}

function addJournalEntry(entry) {
    entry.id = entry.id || generateId();
    const currentEntries = getStoredJournalEntries();
    currentEntries.unshift(entry);
    saveJournalEntries(currentEntries);
    createJournalEntry(entry);
    updateDashboardStats();
}

function updateJournalEntry(entryId, data) {
    const entries = getStoredJournalEntries();
    const updatedEntries = entries.map((entry) => {
        if (entry.id === entryId) {
            return { ...entry, ...data, id: entryId };
        }
        return entry;
    });
    saveJournalEntries(updatedEntries);
    const card = journalGrid.querySelector(`[data-id="${entryId}"]`);
    if (card) {
        card.dataset.linkedDestination = data.destinationId || '';
        card.innerHTML = `
            <div class="journal-entry-top">
                <div>
                    <span class="entry-date">${data.day}</span>
                    <h3>${data.location}</h3>
                </div>
                <div class="journal-entry-actions">
                    <button type="button" class="journal-entry-action" data-action="edit">Edit</button>
                    <button type="button" class="journal-entry-action journal-delete-entry" data-action="delete">Delete</button>
                </div>
            </div>
            <div class="journal-entry-meta">
                <span>${data.mood || 'Mood unknown'}</span>
                <span>${data.weather || 'Weather unknown'}</span>
            </div>
            <p>${data.note}</p>
            <div class="journal-entry-link">
                <div class="journal-entry-link-controls">
                    <button type="button" class="destination-link-button">Open destination</button>
                    <small class="entry-linked-destination">${data.destinationId ? getDestinationName(data.destinationId) : 'No destination selected'}</small>
                </div>
            </div>
            <div class="journal-entry-highlight">Highlight: ${data.highlight || 'No highlight yet'}</div>
        `;
    }
}

function deleteJournalEntryById(entryId) {
    const entries = getStoredJournalEntries().filter((entry) => entry.id !== entryId);
    saveJournalEntries(entries);
    const card = journalGrid.querySelector(`[data-id="${entryId}"]`);
    if (card) card.remove();
    if (editingJournalId === entryId) {
        editingJournalId = null;
        journalForm.reset();
        journalSubmitButton.textContent = 'Save Report';
        updatePreview();
    }
    updateDashboardStats();
}

function editJournalEntry(entryId) {
    const entries = getStoredJournalEntries();
    const entry = entries.find((item) => item.id === entryId);
    if (!entry) return;
    editingJournalId = entryId;
    journalForm.entryDay.value = entry.day;
    journalForm.entryLocation.value = entry.location;
    journalForm.entryMood.value = entry.mood;
    journalForm.entryDestination.value = entry.destinationId || '';
    journalForm.entryHighlight.value = entry.highlight;
    journalForm.entryWeather.value = entry.weather;
    journalForm.entryNote.value = entry.note;
    journalSubmitButton.textContent = 'Update Report';
    updatePreview();
}

journalGrid.addEventListener('click', (event) => {
    const actionButton = event.target.closest('.journal-entry-action');
    if (actionButton) {
        const entryCard = actionButton.closest('.journal-entry');
        if (!entryCard) return;
        const entryId = entryCard.dataset.id;
        const action = actionButton.dataset.action;
        if (action === 'edit') {
            editJournalEntry(entryId);
        } else if (action === 'delete') {
            deleteJournalEntryById(entryId);
        }
        return;
    }

    const linkButton = event.target.closest('.destination-link-button');
    if (linkButton) {
        const entryCard = linkButton.closest('.journal-entry');
        if (!entryCard) return;
        const destinationId = entryCard.dataset.linkedDestination;
        scrollToDestination(destinationId);
        return;
    }
});


function scrollToDestination(destinationId) {
    if (!destinationId) return;
    const target = document.querySelector(`.destination-card[data-destination-id="${destinationId}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('linked-destination-highlight');
    setTimeout(() => target.classList.remove('linked-destination-highlight'), 2000);
}

function createGalleryItem(photo) {
    const title = photo.title || photo.caption || 'Untitled photo';
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.src = photo.src;
    item.dataset.caption = photo.caption || '';
    item.dataset.title = title;

    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-image-wrapper';

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = title;
    wrapper.appendChild(img);

    const captionButton = document.createElement('button');
    captionButton.type = 'button';
    captionButton.className = 'caption-action';
    captionButton.setAttribute('aria-label', 'Add description');
    captionButton.textContent = '+';
    captionButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openGalleryModal(photo.src, photo.caption, title);
    });
    wrapper.appendChild(captionButton);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'gallery-delete';
    deleteButton.setAttribute('aria-label', 'Delete photo');
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        deletePhotoBySrc(photo.src);
    });
    wrapper.appendChild(deleteButton);

    item.appendChild(wrapper);

    const captionText = document.createElement('p');
    captionText.className = 'gallery-caption';
    captionText.textContent = title;
    item.appendChild(captionText);

    item.addEventListener('click', () => {
        openGalleryModal(photo.src, photo.caption, title);
    });

    removeGalleryPlaceholder();
    galleryGrid.prepend(item);
}

function createGalleryPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-placeholder';
    placeholder.innerHTML = `
        <div class="placeholder-illustration">
            <div class="camera-body"></div>
            <div class="camera-lens"></div>
            <div class="flash"></div>
        </div>
        <p>No photos yet. Tap upload to add your first travel memory.</p>
    `;
    galleryGrid.appendChild(placeholder);
}

function removeGalleryPlaceholder() {
    const existing = galleryGrid.querySelector('.gallery-placeholder');
    if (existing) {
        existing.remove();
    }
}

function loadImportedPhotos() {
    galleryGrid.innerHTML = '';
    const imported = getStoredPhotos();
    if (imported.length === 0) {
        createGalleryPlaceholder();
        updateDashboardStats();
        return;
    }

    imported.slice().reverse().forEach(createGalleryItem);
    updateDashboardStats();
}

journalForm.addEventListener('input', updatePreview);

if (loginButton) {
    loginButton.addEventListener('click', () => {
        const username = prompt('Enter a username to save your trip data:');
        if (!username) return;
        localStorage.setItem('roadtrip-user', username.trim());
        updateLoginButton();
        migrateGuestStorageToAccount();
        journalGrid.innerHTML = '';
        galleryGrid.innerHTML = '';
        loadJournalEntries();
        loadImportedPhotos();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    migrateGuestStorageToAccount();
    loadJournalEntries();
    loadImportedPhotos();
    setupDestinationButtons();
    initRouteMap();
    initializeDashboard();
    populateDestinationWeather();
    setupScrollSpyNav();
});

const funFactsByDestination = {
    'dest-1': [
        "Neuschwanstein inspired many fairytale castles—including Disneyland’s Sleeping Beauty Castle ideas.",
        'The castle is modeled after medieval designs but built in the 19th century (so it looks “old” while being relatively new).',
        'Neuschwanstein was built as a tribute to the legend of German composer Richard Wagner.',
    ],

    'dest-2': [
        'Salzburg’s altstadt scene is famously connected to Mozart—there are more than 25 statues and monuments honoring him.',
        'The city’s baroque architecture is so dense that you can often feel like you’re walking through an outdoor museum.',
        "Salzburg was once the birthplace of a famous tradition: the Salzburg Festival, which still attracts artists worldwide.",
    ],
    'dest-3': [
        'Hallstatt is so charming that it’s considered one of Europe’s oldest continually inhabited towns.',
        'The Hallstatt salt mines have been worked for thousands of years—your shoes may even squeak with “salt mine history.”',
        'Hallstatt’s lakeside “storybook” look inspired countless postcards and travel films.',
    ],
    'dest-4': [
        'Lake Bled’s island church is reachable by a traditional wooden boat rowed by local guides.',
        'Visitors often ring the church bell for good luck—then take a moment to admire the view from the shore.',
        'Bled Castle sits high above the lake, giving you one of the best “postcard” perspectives in the area.',
    ],
    'dest-5': [
        'Plitvice’s lakes are famous for their colors—tufa barriers act like natural filters that create shifting turquoise shades.',
        'The waterfalls carve their path over time, so the park’s scenery can subtly change from year to year.',
        'Much of Plitvice is protected wilderness, so wildlife sightings are part of the magic of the trails.',
    ],
    'dest-6': [
        "Split grew around Diocletian’s Palace, and locals still live inside parts of the ancient walls.",
        'Roman emperor Diocletian built his palace with fortress-like walls—so the city grew “around” it.',
        'You can see Roman columns and stonework right next to busy street life—history and daily life blended together.',
    ],
    'dest-7': [
        'Korčula is often nicknamed “Little Dubrovnik” thanks to its fortified old town and medieval vibe.',
        'Korčula’s old town is laid out like a maze—perfect for getting delightfully lost (then finding a viewpoint).',
        'The island has a strong tradition of shipbuilding and maritime culture.',
    ],
    'dest-8': [
        'Mljet is home to a pair of saltwater lakes inside a national park—perfect for a calm swim break.',
        'The park’s forest trails make it feel like a quiet escape from the busy coastlines.',
        'You can rent boats or simply stroll around the lakes for a slower, nature-first day.',
    ],
    'dest-9': [
        'Dubrovnik’s walls are among the best preserved in Europe and were used as a filming location for major TV productions.',
        'Walking the city walls gives you sweeping sea views—and you’ll often spot hidden coves below.',
        'Dubrovnik’s old town was designed with defense in mind, and it still feels dramatically protected.',
    ],
    'dest-10': [
        'Even a ferry day can feel like a mini-cruise—open decks make for the best “ocean air” moment of the trip.',
        'Ferry routes are like moving viewpoints: every few minutes you get a new angle of the coastline.',
        'Many ferries offer outdoor seating, so you can watch the sea change as the light shifts.',
    ],
    'dest-11': [
        'Bologna is known for its porticoes—so you can walk through the city with shade even during hot afternoons.',
        'Some of Bologna’s porticoes are so famous that they’re part of the city’s identity and daily routine.',
        "Bologna is widely celebrated for its food scene—especially fresh pasta and classic sauces.",
    ],
    'dest-12': [
        'Torino is home to the Mole Antonelliana, one of Italy’s most distinctive landmarks (and a great viewpoint).',
        'Torino’s surrounding Alps make the city a natural “gateway” to mountain scenery.',
        'The city has deep roots in Italian innovation and design—so it’s not just beautiful, it’s interesting too.',
    ],
};

function pickFunFact(destinationId) {
    const facts = funFactsByDestination[destinationId];
    if (!facts || !Array.isArray(facts) || facts.length === 0) {
        return 'Fun fact unlocked: every stop has something special.';
    }
    return facts[Math.floor(Math.random() * facts.length)];
}

function ensureFunFactRow(card, destinationId) {
    let row = card.querySelector('.destination-funfact');
    if (!row) {
        row = document.createElement('div');
        row.className = 'destination-funfact hidden';
        row.setAttribute('data-destination-id', destinationId);

        row.innerHTML = `
            <span class="destination-funfact-label">💡 Fun fact</span>
            <p class="destination-funfact-text"></p>
        `;

        card.querySelector('.card-content')?.appendChild(row);
    }
    return row;
}

function showFunFact(destinationId) {
    const fact = pickFunFact(destinationId);
    const card = document.querySelector(`.destination-card[data-destination-id="${destinationId}"]`);
    if (!card) return;

    document.querySelectorAll('.destination-funfact').forEach((el) => {
        if (el.dataset.destinationId !== destinationId) {
            el.classList.add('hidden');
        }
    });

    const row = ensureFunFactRow(card, destinationId);
    const textEl = row.querySelector('.destination-funfact-text');
    if (textEl) {
        textEl.textContent = fact;
    }
    row.classList.remove('hidden');
    row.style.display = '';
    row.setAttribute('aria-live', 'polite');
}

function injectMapPinButtons() {
    const destinationCards = document.querySelectorAll('.destination-card[data-destination-id]');
    destinationCards.forEach((card) => {
        const destinationId = card.dataset.destinationId;
        const content = card.querySelector('.card-content');
        if (!content || card.querySelector('.map-pin-button')) return;

        const controlsRow = document.createElement('div');
        controlsRow.className = 'destination-card-footer';

        const pinButton = document.createElement('button');
        pinButton.type = 'button';
        pinButton.className = 'map-pin-button';
        pinButton.dataset.destinationId = destinationId;
        pinButton.setAttribute('aria-label', `Zoom to ${getDestinationName(destinationId)}`);
        pinButton.textContent = '📍';

        const exploreLink = content.querySelector('.explore-btn[data-destination-id]');
        const funFactButton = document.createElement('button');
        funFactButton.type = 'button';
        funFactButton.className = 'funfact-button';
        funFactButton.dataset.destinationId = destinationId;
        funFactButton.setAttribute('aria-label', `Show fun fact for ${getDestinationName(destinationId)}`);
        funFactButton.textContent = '💡';

        if (exploreLink) {
            exploreLink.classList.add('destination-card-explore');
            controlsRow.appendChild(pinButton);
            controlsRow.appendChild(funFactButton);
            controlsRow.appendChild(exploreLink);
            content.appendChild(controlsRow);
        } else {
            controlsRow.appendChild(pinButton);
            controlsRow.appendChild(funFactButton);
            content.appendChild(controlsRow);
        }

        funFactButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            showFunFact(destinationId);
        });
    });
}

function setupDestinationButtons() {
    injectMapPinButtons();

    const buttons = document.querySelectorAll('.explore-btn[data-destination-id]');
    buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const destinationId = button.dataset.destinationId;
            if (!destinationId) return;
            flyToDestination(destinationId);

            const linkedEntry = document.querySelector(`.journal-entry[data-linked-destination="${destinationId}"]`);
            if (linkedEntry) {
                linkedEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
                linkedEntry.classList.add('linked-destination-highlight');
                setTimeout(() => linkedEntry.classList.remove('linked-destination-highlight'), 2000);
                return;
            }
            const destinationCard = button.closest('.destination-card');
            if (destinationCard) {
                destinationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                destinationCard.classList.add('linked-destination-highlight');
                setTimeout(() => destinationCard.classList.remove('linked-destination-highlight'), 2000);
            }
        });
    });


    const pinButtons = document.querySelectorAll('.map-pin-button[data-destination-id]');
    pinButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const destinationId = button.dataset.destinationId;
            if (!destinationId) return;
            const mapSection = document.getElementById('trip');
            if (mapSection) {
                mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            flyToDestination(destinationId);
        });
    });

    const destinationCards = document.querySelectorAll('.destination-card[data-destination-id]');
    destinationCards.forEach((card) => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('.explore-btn') || event.target.closest('.map-pin-button') || event.target.closest('.funfact-button')) return;
            const destinationId = card.dataset.destinationId;
            flyToDestination(destinationId);
        });
    });


    const timelineItems = document.querySelectorAll('.timeline-item[data-destination-id]');
    timelineItems.forEach((item) => {
        item.addEventListener('click', () => {
            const destinationId = item.dataset.destinationId;
            flyToDestination(destinationId);
        });
    });
}

function collectJournalEntryData() {
    const formData = new FormData(journalForm);
    const destinationId = formData.get('entryDestination') || '';
    return {
        day: formData.get('entryDay').trim() || 'Day 1',
        location: formData.get('entryLocation').trim() || 'Unknown location',
        mood: formData.get('entryMood').trim() || 'Happy',
        destinationId,
        highlight: formData.get('entryHighlight').trim() || 'Favorite moment',
        weather: formData.get('entryWeather').trim() || 'Sunny',
        note: formData.get('entryNote').trim() || 'A special moment from the day.',
    };
}

function calculateCountdown() {
    const targetDate = TRIP_START_DATE;
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
        return 'Departure day is here!';
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function updateCountdown() {
    const countdown = document.getElementById('departureCountdown');
    if (!countdown) return;
    countdown.textContent = calculateCountdown();
}

async function fetchWeather() {
    const weatherSummary = document.getElementById('weatherSummary');
    if (!weatherSummary) return;
    weatherSummary.textContent = 'Loading latest weather...';
    const weatherData = await fetchWeatherForCoords(routeWeatherCoords[0], routeWeatherCoords[1]);
    if (weatherData) {
        weatherSummary.textContent = `${weatherData.temperature}°C · ${weatherData.windspeed} km/h · ${weatherData.description}`;
    } else {
        weatherSummary.textContent = 'Weather unavailable right now.';
    }
}

function updateProgress() {
    const progressFill = document.getElementById('tripProgressFill');
    const progressLabel = document.getElementById('tripProgressLabel');
    if (!progressFill || !progressLabel) return;
    const totalDays = 17;
    const currentDay = 2; // rough estimate for trip planning progress
    const progress = Math.min(100, Math.round((currentDay / totalDays) * 100));
    progressFill.style.width = `${progress}%`;
    progressLabel.textContent = `${progress}% of the trip planning complete`;
}

function getSampledRoutePoints(polyline, samplePerSegment = 60) {
    if (!polyline) return [];
    const latlngs = polyline.getLatLngs();
    const parts = Array.isArray(latlngs[0]) ? latlngs : [latlngs];

    const out = [];
    const toPoint = (ll) => ({ lat: ll.lat, lng: ll.lng });

    parts.forEach((seg) => {
        if (!seg || seg.length < 2) return;
        for (let i = 0; i < seg.length - 1; i++) {
            const a = seg[i];
            const b = seg[i + 1];
            for (let s = 0; s <= samplePerSegment; s++) {
                const t = s / samplePerSegment;
                out.push({
                    lat: a.lat + (b.lat - a.lat) * t,
                    lng: a.lng + (b.lng - a.lng) * t,
                });
            }
        }
    });

    // De-dupe consecutive points (helps marker stability)
    const deduped = [];
    for (let i = 0; i < out.length; i++) {
        const p = out[i];
        const prev = deduped[deduped.length - 1];
        if (!prev || prev.lat !== p.lat || prev.lng !== p.lng) deduped.push(p);
    }
    return deduped;
}

function setupRouteCar() {
    // Car as a rotated divIcon marker
    const startCoord = routePolyline?.getLatLngs?.()[0]?.[0] || mapDestinations['dest-1']?.coord;
    if (!startCoord || !routeMap || !routePolyline) return;

    const startLatLng = Array.isArray(startCoord)
        ? { lat: startCoord[0], lng: startCoord[1] }
        : startCoord;

    const carIcon = L.divIcon({
        className: 'route-car-icon',
        html: `
            <div class="route-car">
                <div class="route-car-body">🚗</div>
            </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
    });

    carMarker = L.marker([startLatLng.lat, startLatLng.lng], {
        icon: carIcon,
        interactive: false,
        zIndexOffset: 1000,
    }).addTo(routeMap);

    sampledRoutePoints = getSampledRoutePoints(routePolyline, 55);
    if (!sampledRoutePoints.length) return;

    updateCarPositionByTripDate();
    if (window.routePositionUpdateIntervalId) {
        clearInterval(window.routePositionUpdateIntervalId);
    }
    window.routePositionUpdateIntervalId = setInterval(updateCarPositionByTripDate, 60 * 60 * 1000);
}

function getTripProgressRatio(now = new Date()) {
    if (now < TRIP_START_DATE) return 0;
    if (now >= TRIP_END_DATE) return 1;
    return (now - TRIP_START_DATE) / (TRIP_END_DATE - TRIP_START_DATE);
}

function updateCarHeading(index) {
    if (!carMarker || !sampledRoutePoints.length) return;
    const maxIndex = sampledRoutePoints.length - 1;
    const p1 = sampledRoutePoints[index];
    const p2 = sampledRoutePoints[Math.min(index + 1, maxIndex)];
    if (!p1 || !p2) return;
    const headingRad = Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat);
    const headingDeg = (headingRad * 180) / Math.PI;
    const iconEl = carMarker.getElement?.();
    if (iconEl) {
        const carEl = iconEl.querySelector('.route-car');
        if (carEl) carEl.style.transform = `rotate(${headingDeg}deg)`;
    }
}

function updateCarPositionByTripDate() {
    if (!carMarker || !sampledRoutePoints.length) return;
    const ratio = getTripProgressRatio(new Date());
    const maxIndex = sampledRoutePoints.length - 1;
    const exactIndex = ratio * maxIndex;
    const index = Math.min(maxIndex, Math.max(0, Math.round(exactIndex)));
    const point = sampledRoutePoints[index];
    if (!point) return;

    carMarker.setLatLng([point.lat, point.lng]);
    updateCarHeading(index);
}

function startRouteCarAnimation() {
    if (!carMarker || !sampledRoutePoints.length) return;
    updateCarPositionByTripDate();
}



let statsAnimated = false;
function animateStats() {
    const statElements = document.querySelectorAll('.trip-stats [data-target]');
    statElements.forEach((statEl) => {
        const target = Number(statEl.dataset.target);
        const duration = 1500;
        const startTime = performance.now();
        function update(time) {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.round(progress * target);
            statEl.textContent = target >= 3000 && progress === 1 ? '3000+' : value;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    });
}

function observeStatAnimation() {
    const statsSection = document.querySelector('.trip-stats');
    if (!statsSection) {
        animateStats();
        return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateStats();
                obs.disconnect();
            }
        });
    }, { threshold: 0.3 });
    observer.observe(statsSection);
}

function initializeDashboard() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
    fetchWeather();
    updateProgress();
    const refreshButton = document.getElementById('refreshWeather');
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchWeather);
    }
    updateDashboardStats();
    observeStatAnimation();
}

function saveJournalAction() {
    const entryData = collectJournalEntryData();
    if (editingJournalId) {
        updateJournalEntry(editingJournalId, entryData);
        editingJournalId = null;
        journalSubmitButton.textContent = 'Save Report';
    } else {
        addJournalEntry(entryData);
    }
    journalForm.reset();
    updatePreview();
}

journalSubmitButton.addEventListener('click', saveJournalAction);

updatePreview();

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    },
    { threshold: 0.2 }
);

sections.forEach((section) => observer.observe(section));
