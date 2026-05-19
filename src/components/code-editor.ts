import '../styles/editor.css';

const SANDBOX_HTML = `<!DOCTYPE html>
<html><body>
<div id="main-heading">Welcome to CodeLabs</div>
<button id="action-btn">Click Me</button>
<div id="output"></div>
<input id="email" value="a@b.com">
<input id="password" value="password123">
<form id="login-form"><input id="login-email"><input id="login-password"><div id="result"></div></form>
</body></html>`;

export function createSandbox(code: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.srcdoc = SANDBOX_HTML.replace('</body>', `<script>
${code}
</script></body>`);
  return iframe;
}

export function createEditor(
  container: HTMLElement,
  starterCode: string,
): {
  getCode: () => string;
  setCode: (code: string) => void;
  onRun: (callback: () => void) => void;
} {
  const wrapper = document.createElement('div');
  wrapper.className = 'editor-wrapper';

  const textarea = document.createElement('textarea');
  textarea.className = 'editor-textarea';
  textarea.value = starterCode;
  textarea.spellcheck = false;

  const runBtn = document.createElement('button');
  runBtn.className = 'editor-run';
  runBtn.textContent = 'Run Tests';

  wrapper.appendChild(textarea);
  wrapper.appendChild(runBtn);
  container.appendChild(wrapper);

  return {
    getCode: () => textarea.value,
    setCode: (code: string) => {
      textarea.value = code;
    },
    onRun: (callback: () => void) => {
      runBtn.addEventListener('click', callback);
    },
  };
}
