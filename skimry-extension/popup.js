const API_BASE = 'http://localhost:8080';

const extractBtn = document.getElementById('extractBtn');
const statusBox = document.getElementById('status');
const summaryBox = document.getElementById('summaryBox');
const summaryList = document.getElementById('summaryList');
const sourceLink = document.getElementById('sourceLink');

const authSection = document.getElementById('authSection');
const extractSection = document.getElementById('extractSection');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');

function setStatus(message, type) {
  statusBox.className = type;
  statusBox.textContent = message;
  statusBox.style.display = 'block';
}

function clearStatus() {
  statusBox.textContent = '';
  statusBox.className = '';
  statusBox.style.display = 'none';
}

function clearSummary() {
  summaryList.innerHTML = '';
  summaryBox.style.display = 'none';
  sourceLink.style.display = 'none';
}

function renderSummary(points, originalUrl) {
  summaryList.innerHTML = '';

  points.forEach((point) => {
    const li = document.createElement('li');
    li.textContent = point;
    summaryList.appendChild(li);
  });

  sourceLink.href = originalUrl;
  sourceLink.textContent = 'View source';
  sourceLink.style.display = 'inline-block';
  summaryBox.style.display = 'block';
}

function showLoginView() {
  authSection.style.display = 'block';
  extractSection.style.display = 'none';
  clearSummary();
}

function showExtractorView() {
  authSection.style.display = 'none';
  extractSection.style.display = 'block';
}

async function checkLoginStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/users/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 401) return false;

    const data = await response.json().catch(() => ({}));
    return Boolean(data?.isLoggedIn);
  } catch (err) {
    setStatus(`Network error: ${err.message}`, 'error');
    return false;
  }
}

async function loginFromPopup(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data?.message || data?.Error || 'Login failed';
    throw new Error(msg);
  }
}

async function initializePopup() {
  clearStatus();
  setStatus('Checking login...', 'processing');

  const loggedIn = await checkLoginStatus();

  if (loggedIn) {
    showExtractorView();
    setStatus('Logged in. Ready to summarize.', 'success');
  } else {
    showLoginView();
    setStatus('Please log in to continue.', 'error');
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginBtn.disabled = true;
  setStatus('Logging in...', 'processing');

  try {
    await loginFromPopup(loginEmail.value.trim(), loginPassword.value);
    const loggedIn = await checkLoginStatus();

    if (loggedIn) {
      showExtractorView();
      setStatus('Login successful. You can now summarize.', 'success');
    } else {
      showLoginView();
      setStatus('Login succeeded but session check failed.', 'error');
    }
  } catch (err) {
    setStatus(err.message || 'Login failed', 'error');
  } finally {
    loginBtn.disabled = false;
  }
});

extractBtn.addEventListener('click', async () => {
  extractBtn.disabled = true;
  clearSummary();

  const loggedIn = await checkLoginStatus();
  if (!loggedIn) {
    showLoginView();
    setStatus('Session expired. Please log in again.', 'error');
    extractBtn.disabled = false;
    return;
  }

  setStatus('Extracting page content...', 'processing');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      setStatus('No active tab found.', 'error');
      extractBtn.disabled = false;
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: extractPageText,
      },
      async (results) => {
        if (!results || !results[0] || !results[0].result) {
          setStatus('Failed to extract content.', 'error');
          extractBtn.disabled = false;
          return;
        }

        const payload = results[0].result;
        setStatus('Generating summary...', 'processing');

        try {
          const response = await fetch(`${API_BASE}/api/materials/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              originalUrl: payload.originalUrl,
              rawText: payload.rawText,
            }),
          });

          const data = await response.json().catch(() => ({}));

          if (response.ok) {
            const points = Array.isArray(data?.aiSummary) ? data.aiSummary : [];
            renderSummary(points, data?.originalUrl || payload.originalUrl);
            setStatus('Summary ready.', 'success');
          } else if (response.status === 401) {
            showLoginView();
            setStatus('You are not logged in.', 'error');
          } else {
            const message = data?.Error || data?.message || 'Unknown error';
            setStatus(message, 'error');
          }
        } catch (err) {
          setStatus(`Network error: ${err.message}`, 'error');
        } finally {
          extractBtn.disabled = false;
        }
      }
    );
  } catch (err) {
    setStatus(`Extension error: ${err.message}`, 'error');
    extractBtn.disabled = false;
  }
});

function extractPageText() {
  const MAX_CHAR_LIMIT = 4000;

  const isPopUpOrHidden = (el) => {
    if (!el) return true;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return true;
    }

    const popupSelector = [
      '#cookie-banner', '#cookie-consent', '.cookie-banner', '.cookie-consent',
      '.modal', '.popup', '.overlay', '[role="dialog"]', '[aria-modal="true"]',
      'nav', 'footer', '.ad-container', '.advertisement'
    ].join(', ');

    return el.closest(popupSelector) !== null;
  };

  const paragraphs = Array.from(document.querySelectorAll('p, article, h1, h2, h3'));

  let fullText = paragraphs
    .filter((p) => !isPopUpOrHidden(p))
    .map((p) => (p.innerText ? p.innerText.trim() : ''))
    .filter((text) => {
      if (text.length < 20) return false;
      if (/cookie|privacy policy|terms of service|accept all|manage preferences|subscribe/i.test(text)) {
        return false;
      }
      return true;
    })
    .join(' ');

  if (!fullText) {
    fullText = document.body.innerText || '';
  }

  const cleanedText = fullText.replace(/\s+/g, ' ').trim();

  const safeText =
    cleanedText.length > MAX_CHAR_LIMIT
      ? cleanedText.slice(0, MAX_CHAR_LIMIT) + '...'
      : cleanedText;

  return {
    originalUrl: window.location.href,
    rawText: safeText,
  };
}

initializePopup();
