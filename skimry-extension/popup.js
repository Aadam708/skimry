document.getElementById('extractBtn').addEventListener('click', async () => {
  // 1. Get the currently active browser tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) return;

  // 2. Inject a script into the page to grab text content
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractPageText,
  }, async (results) => {
    if (!results || !results[0] || !results[0].result) {
      console.log("Failed to extract content.");
      return;
    }

    const payload = results[0].result;

    console.log("=== SKIMRY EXTRACTED PAYLOAD ===");
    console.log("Source URL:", payload.originalUrl);
    console.log("Character Count:", payload.rawText.length);
    console.log("Truncated Raw Text:", payload.rawText);

    // 3. Send the extracted content to your backend
    try {
      const response = await fetch('http://localhost:8080/api/materials/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRITICAL: includes HttpOnly cookies automatically
        body: JSON.stringify({
          originalUrl: payload.originalUrl,
          rawText: payload.rawText,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Material saved successfully:", result);
        alert(`✅ Saved! ${result.aiSummary?.length || 0} summary points generated.`);
      } else if (response.status === 401) {
        console.error("❌ Not authenticated. Please log in at the website first.");
        alert("❌ Not authenticated. Log in at http://localhost:3000 first.");
      } else {
        const error = await response.json();
        console.error("❌ Error:", error);
        alert(`❌ Error: ${error.Error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert(`❌ Network error: ${err.message}`);
    }
  });
});

// Function executed directly inside the web page environment
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

  console.log("%c[Skimry] Extracted Text Payload:", "color: #ec4899; font-weight: bold;", {
    url: window.location.href,
    length: safeText.length,
    text: safeText
  });

  return {
    originalUrl: window.location.href,
    rawText: safeText
  };
}
