const messageBox = document.getElementById('messageBox');

const showMessage = (text, type = 'error') => {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const rawText = await response.text();
    throw new Error(
      `Response bukan JSON dari ${url}. Pastikan backend Express aktif dan endpoint mengembalikan JSON. Detail: ${rawText.slice(0, 80)}`
    );
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Request gagal diproses.');
  }

  return payload;
};

const loadFeedTypes = async () => {
  const select = document.getElementById('feedTypeSelect');
  if (!select) return;

  try {
    const payload = await fetchJson('/api/feed-types');

    payload.data.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.name;
      option.textContent = item.name;
      select.appendChild(option);
    });
  } catch (error) {
    showMessage(error.message);
  }
};

const setupPredictionForm = () => {
  const form = document.getElementById('predictionForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const input = {
      bulan: Number(formData.get('bulan')),
      jumlahDomba: Number(formData.get('jumlahDomba')),
      konsumsiPakan: Number(formData.get('konsumsiPakan')),
      jenisPakan: formData.get('jenisPakan')
    };

    sessionStorage.setItem('prediksi_input', JSON.stringify(input));
    window.location.href = '/proses.html';
  });
};

const processPrediction = async () => {
  if (!window.location.pathname.endsWith('/proses.html')) return;

  const rawInput = sessionStorage.getItem('prediksi_input');
  if (!rawInput) {
    window.location.href = '/input-data.html';
    return;
  }

  try {
    const input = JSON.parse(rawInput);
    const payload = await fetchJson('/prediksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    sessionStorage.setItem('prediksi_output', JSON.stringify({ input, output: payload }));
    window.location.href = '/hasil.html';
  } catch (error) {
    sessionStorage.setItem('prediksi_error', error.message);
    window.location.href = '/input-data.html';
  }
};

const renderHasil = () => {
  if (!window.location.pathname.endsWith('/hasil.html')) return;

  const root = document.getElementById('resultContainer');
  if (!root) return;

  const raw = sessionStorage.getItem('prediksi_output');
  if (!raw) {
    root.innerHTML = '<p>Data hasil tidak ditemukan. Silakan prediksi ulang.</p>';
    return;
  }

  const { input, output } = JSON.parse(raw);
  root.innerHTML = `
    <div class="result-list">
      <p><strong>Bulan Prediksi:</strong> ${input.bulan}</p>
      <p><strong>Jumlah Domba:</strong> ${input.jumlahDomba}</p>
      <p><strong>Konsumsi Pakan:</strong> ${input.konsumsiPakan} kg/hari</p>
      <p><strong>Jenis Pakan:</strong> ${input.jenisPakan}</p>
      <hr />
      <p><strong>Hasil Prediksi:</strong> ${output.prediksi}</p>
      <p><strong>MAPE:</strong> ${output.mape}%</p>
      <p><strong>Interpretasi Akurasi:</strong> ${output.interpretasi}</p>
    </div>
  `;
};

const showStoredError = () => {
  const error = sessionStorage.getItem('prediksi_error');
  if (!error) return;

  showMessage(error, 'error');
  sessionStorage.removeItem('prediksi_error');
};

const init = async () => {
  await loadFeedTypes();
  setupPredictionForm();
  showStoredError();
  await processPrediction();
  renderHasil();
};

window.addEventListener('DOMContentLoaded', init);
