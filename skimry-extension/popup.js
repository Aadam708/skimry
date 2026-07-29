const extractBtn = document.getElementById('extractBtn');
const statusBox = document.getElementById('status');
const summaryBox = document.getElementById('summaryBox');
const summaryList = document.getElementById('summaryList');
const sourceLink = document.getElementById('sourceLink');

function setStatus(message, type) {
  statusBox.className = type;
  statusBox.textContent = message;
  statusBox.style.display = 'block';
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

extractBtn.addEventListener('click', async () => {
  extractBtn.disabled = true;
  clearSummary();
  setStatus('Extracting page content...', 'processing');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      setStatus('No active tab found.', 'error');
      extractBtn.disabled = false;
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageText,
    }, async (results) => {
      if (!results || !results[0] || !results[0].result) {
        setStatus('Failed to extract content.', 'error');
        extractBtn.disabled = false;
        return;
      }

      const payload = results[0].result;

      setStatus('Generating summary...', 'processing');

      try {
        const response = await fetch('http://localhost:8080/api/materials/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            originalUrl: payload.originalUrl,
            rawText: payload.rawText,
          }),
        });

        const data = await response.json().catch(() => null);

        if (response.ok) {
          const points = Array.isArray(data?.aiSummary) ? data.aiSummary : [];
          renderSummary(points, data?.originalUrl || payload.originalUrl);
          setStatus('Summary ready.', 'success');
        } else {
          const message = data?.Error || data?.message || 'Unknown error';
          setStatus(message, 'error');
        }
      } catch (err) {
        setStatus(`Network error: ${err.message}`, 'error');
      } finally {
        extractBtn.disabled = false;
      }
    });
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
    .filter(p => !isPopUpOrHidden(p))
    .map(p => p.innerText ? p.innerText.trim() : '')
    .filter(text => {
      if (text.length < 20) return false;
      if (/cookie|privacy policy|terms of service|accept all|manage preferences|subscribe/i.test(text)) {
        return false;
      }
      return true;
    })
    .join(' ');

  if (!fullText) {
    fullText = document.body.innerText || "";
  }

  const cleanedText = fullText.replace(/\s+/g, ' ').trim();

  const safeText = cleanedText.length > MAX_CHAR_LIMIT
    ? cleanedText.slice(0, MAX_CHAR_LIMIT) + "..."
    : cleanedText;

  return {
    originalUrl: window.location.href,
    rawText: safeText
  };
}
