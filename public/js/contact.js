document.addEventListener('DOMContentLoaded', () => {
  const copyButtons = document.querySelectorAll('.copy-btn');
  
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy');

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
          showCopied(btn);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          textarea.style.top = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          
          try {
            const successful = document.execCommand('copy');
            if (successful) {
              showCopied(btn);
            } else {
              throw new Error('Copy command failed');
            }
          } catch (err) {
            console.error('Erreur de copie:', err);
            alert('Impossible de copier automatiquement. Veuillez copier manuellement : ' + textToCopy);
          } finally {
            document.body.removeChild(textarea);
          }
        }
      } catch (err) {
        console.error('Erreur de copie:', err);
        alert('Impossible de copier automatiquement. Veuillez copier manuellement : ' + textToCopy);
      }
    });
  });

  function showCopied(btn) {
    const originalText = btn.textContent;
    btn.textContent = 'Copié !';
    btn.classList.add('copied');
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  }
});