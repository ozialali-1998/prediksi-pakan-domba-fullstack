const ADD_FEED_VALUE = '__add_new__';

const messageBox = document.getElementById('messageBox');

const showMessage = (message, type = 'error') => {
  if (!messageBox) return;
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
};

const clearMessage = () => {
  if (!messageBox) return;
  messageBox.textContent = '';
  messageBox.className = 'message';
};

const loadFeedTypes = async () => {
  const select = document.getElementById('feedTypeSelect');
  if (!select) return;

  try {
    const response = await fetch('/api/feed-types');
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Gagal memuat jenis pakan.');
    }

    select.innerHTML = '<option value="">Pilih jenis pakan</option>';
    json.data.forEach((feed) => {
      const option = document.createElement('option');
      option.value = feed.id;
      option.textContent = `${feed.name} (Protein: ${feed.protein}%, Energi: ${feed.energy} kcal)`;
      select.appendChild(option);
    });

    const addOption = document.createElement('option');
    addOption.value = ADD_FEED_VALUE;
    addOption.textContent = 'Tambah Jenis Pakan';
    select.appendChild(addOption);
  } catch (error) {
    showMessage(error.message);
  }
};

const setupFeedTypeToggle = () => {
  const select = document.getElementById('feedTypeSelect');
  const customFeedSection = document.getElementById('customFeedSection');
  if (!select || !customFeedSection) return;

  select.addEventListener('change', () => {
    if (select.value === ADD_FEED_VALUE) {
      customFeedSection.classList.remove('hidden');
      showMessage('Silakan isi form untuk menambah jenis pakan baru.', 'success');
    } else {
      customFeedSection.classList.add('hidden');
      clearMessage();
    }
  });
};

const setupCustomFeedForm = () => {
  const form = document.getElementById('customFeedForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      protein: Number(formData.get('protein')),
      energy: Number(formData.get('energy'))
    };

    try {
      const response = await fetch('/api/feed-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan jenis pakan baru.');
      }

      showMessage('Jenis pakan baru berhasil disimpan dan siap digunakan.', 'success');
      form.reset();
      await loadFeedTypes();
    } catch (error) {
      showMessage(error.message);
    }
  });
};

const setupPredictionForm = () => {
  const form = document.getElementById('predictionForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const formData = new FormData(form);
    const feedTypeId = formData.get('feedTypeId');

    if (!feedTypeId || feedTypeId === ADD_FEED_VALUE) {
      showMessage('Pilih jenis pakan yang valid sebelum memproses prediksi.');
      return;
    }

    const payload = {
      berat: Number(formData.get('berat')),
      umur: Number(formData.get('umur')),
      jumlah: Number(formData.get('jumlah')),
      feedTypeId: Number(feedTypeId)
    };

    sessionStorage.setItem('prediction_payload', JSON.stringify(payload));
    window.location.href = '/proses.html';
  });
};

const runPredictionProcessPage = async () => {
  if (!window.location.pathname.endsWith('/proses.html')) return;

  const payloadRaw = sessionStorage.getItem('prediction_payload');
  if (!payloadRaw) {
    window.location.href = '/input-data.html';
    return;
  }

  try {
    const payload = JSON.parse(payloadRaw);
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Prediksi gagal diproses.');
    }

    sessionStorage.setItem('prediction_result', JSON.stringify({
      input: payload,
      output: json.data
    }));

    setTimeout(() => {
      window.location.href = '/hasil.html';
    }, 1200);
  } catch (error) {
    sessionStorage.removeItem('prediction_payload');
    sessionStorage.setItem('prediction_error', error.message);
    window.location.href = '/input-data.html';
  }
};

const renderResultPage = () => {
  if (!window.location.pathname.endsWith('/hasil.html')) return;

  const container = document.getElementById('resultContainer');
  if (!container) return;

  const rawData = sessionStorage.getItem('prediction_result');
  if (!rawData) {
    container.innerHTML = '<p>Data hasil tidak ditemukan. Silakan lakukan prediksi ulang.</p>';
    return;
  }

  const { input, output } = JSON.parse(rawData);
  container.innerHTML = `
    <div class="result-list">
      <p><strong>Berat Domba:</strong> ${input.berat} kg</p>
      <p><strong>Umur Domba:</strong> ${input.umur} bulan</p>
      <p><strong>Jumlah Domba:</strong> ${input.jumlah} ekor</p>
      <p><strong>Jenis Pakan:</strong> ${output.feedType.name}</p>
      <p><strong>Protein:</strong> ${output.feedType.protein}%</p>
      <p><strong>Energi:</strong> ${output.feedType.energy} kcal</p>
      <p><strong>Nilai Prediksi Pakan:</strong> ${output.prediction} unit</p>
    </div>
  `;
};

const showPendingError = () => {
  const error = sessionStorage.getItem('prediction_error');
  if (!error) return;
  showMessage(error);
  sessionStorage.removeItem('prediction_error');
};

const initialize = async () => {
  await loadFeedTypes();
  setupFeedTypeToggle();
  setupCustomFeedForm();
  setupPredictionForm();
  showPendingError();
  await runPredictionProcessPage();
  renderResultPage();
};

window.addEventListener('DOMContentLoaded', initialize);
