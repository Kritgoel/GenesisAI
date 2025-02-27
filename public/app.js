
document.addEventListener('DOMContentLoaded', function() {
  const modeBtns = document.querySelectorAll('.mode-btn');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const generateBtn = document.getElementById('generate');
  const promptInput = document.getElementById('prompt');
  const imageInput = document.getElementById('image-input');
  const imagePreview = document.getElementById('image-preview');
  const uploadBtn = document.getElementById('upload-btn');
  const resultText = document.querySelector('.result-text');
  const resultImage = document.querySelector('.result-image');
  const loader = document.querySelector('.loader');
  const loaderText = document.querySelector('.loader-text');
  const errorMessage = document.querySelector('.error-message');
  const btnText = generateBtn.querySelector('.btn-text');
  const btnIcon = generateBtn.querySelector('.btn-icon');

  let currentMode = 'text';
  let currentImage = null;

  const themes = {
    space: {
      bg: 'var(--space-bg)',
      card: 'var(--space-card)',
      primary: 'var(--space-primary)',
      secondary: 'var(--space-secondary)',
      text: 'var(--space-text)',
      muted: 'var(--space-muted)'
    },
    ocean: {
      bg: 'var(--ocean-bg)',
      card: 'var(--ocean-card)',
      primary: 'var(--ocean-primary)',
      secondary: 'var(--ocean-secondary)',
      text: 'var(--ocean-text)',
      muted: 'var(--ocean-muted)'
    },
    forest: {
      bg: 'var(--forest-bg)',
      card: 'var(--forest-card)',
      primary: 'var(--forest-primary)',
      secondary: 'var(--forest-secondary)',
      text: 'var(--forest-text)',
      muted: 'var(--forest-muted)'
    }
  };

  const loadingMessages = [
    "Analyzing input...",
    "Processing data...",
    "Examining symptoms...",
    "Generating insights...",
    "Preparing response..."
  ];

  createStars();

  function clearResults() {
    if (resultText) resultText.textContent = '';
    if (resultImage) resultImage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
  }

  function showError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth' });
  }

  function getRandomLoadingMessage() {
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  }

  function scrollToResult() {
    const resultArea = document.querySelector('.result-area');
    if (resultArea) {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        currentImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
          uploadBtn.textContent = 'Change Image';
        };
        reader.readAsDataURL(file);
      } else {
        showError('Please upload an image file');
        imageInput.value = '';
      }
    }
  }

  async function generate(prompt, mode, image = null) {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('mode', mode);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (mode === 'image') {
        return response.blob();
      } else {
        return response.json();
      }
    } catch (error) {
      throw error;
    }
  }

  if (themeBtns) {
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const selectedTheme = themes[theme];
        for (const [property, value] of Object.entries(selectedTheme)) {
          document.documentElement.style.setProperty(`--${property}`, value);
        }
      });
    });
  }

  if (modeBtns) {
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        
        const imageUploadArea = document.querySelector('.image-upload-area');
        if (currentMode === 'multimodal') {
          imageUploadArea.style.display = 'block';
          promptInput.placeholder = "Ask questions about the image...";
        } else if (currentMode === 'image') {
          imageUploadArea.style.display = 'none';
          promptInput.placeholder = "Describe the image you want to generate...";
        } else {
          imageUploadArea.style.display = 'none';
          promptInput.placeholder = "Tell me your symptoms...";
        }
        
        clearResults();
      });
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      if (!promptInput) return;
      
      const prompt = promptInput.value.trim();
      if (!prompt && currentMode !== 'multimodal') {
        showError('Please enter a prompt first.');
        promptInput.focus();
        return;
      }

      if (currentMode === 'multimodal' && !currentImage) {
        showError('Please upload an image for analysis.');
        return;
      }

      clearResults();
      generateBtn.disabled = true;
      if (loader) loader.style.display = 'block';
      if (loaderText) loaderText.textContent = getRandomLoadingMessage();
      if (btnText) btnText.textContent = 'Processing...';
      if (btnIcon) btnIcon.className = 'fas fa-circle-notch fa-spin';

      try {
        if (currentMode === 'text') {
          const data = await generate(prompt, 'text');
          if (resultText) {
            resultText.textContent = data[0]?.generated_text || "No response generated.";
            scrollToResult();
          }
        } else if (currentMode === 'image') {
          const imageBlob = await generate(prompt, 'image');
          if (resultImage) {
            const imageUrl = URL.createObjectURL(imageBlob);
            resultImage.src = imageUrl;
            resultImage.style.display = 'block';
            resultImage.onload = scrollToResult;
          }
        } else if (currentMode === 'multimodal') {
          const data = await generate(prompt, 'multimodal', currentImage);
          if (resultText) {
            resultText.textContent = data.generated_text || "No analysis generated.";
            scrollToResult();
          }
        }
      } catch (error) {
        showError(`Generation failed: ${error.message}`);
      } finally {
        generateBtn.disabled = false;
        if (loader) loader.style.display = 'none';
        if (btnText) btnText.textContent = 'Create';
        if (btnIcon) btnIcon.className = 'fas fa-sparkles';
      }
    });
  }

  
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      imageInput.click();
    });
  }

  // Keyboard shortcuts
  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        generateBtn.click();
      }
    });

    promptInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  }

  // Initialize tooltips
  const featuresBtn = document.querySelector('.features-btn');
  const featuresTooltip = document.querySelector('.features-tooltip');

  if (featuresBtn && featuresTooltip) {
    featuresBtn.addEventListener('mouseenter', () => {
      featuresTooltip.style.display = 'block';
    });

    featuresBtn.addEventListener('mouseleave', () => {
      featuresTooltip.style.display = 'none';
    });
  }

  // Initialize with default theme
  document.body.classList.add('theme-space');
});

// Create animated star background
function createStars() {
  const stars = document.querySelector('.stars');
  if (!stars) return;
  
  const numStars = 100;
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    const size = `${Math.random() * 3}px`;
    star.style.width = size;
    star.style.height = size;
    star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
    star.style.setProperty('--delay', `${Math.random() * 2}s`);
    stars.appendChild(star);
  }
}
