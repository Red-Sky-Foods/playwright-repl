export const recommendedLocator = `const recommendedLocator = (el) => {
  if (!el) throw new Error('Element not found');

  // Use data-testid if available
  const testId = el.getAttribute('data-testid');
  if (testId) {
    return \`getByTestId('\${testId}')\`;
  }

  // Use getByLabel if the element is associated with a label
  const label = el.labels?.[0]?.textContent?.trim();
  if (label) {
    return \`getByLabel('\${label}')\`;
  }

  // Use getByText if the element contains meaningful text
  const text = el.textContent?.trim();
  if (text && text.length > 0) {
    return \`getByText('\${text}')\`;
  }

  // Use getByRole if the element has an ARIA role
  const role = el.getAttribute('role');
  if (role) {
    const name = el.getAttribute('aria-label') || el.textContent?.trim();
    return name ? \`getByRole('\${role}', { name: '\${name}' })\` : \`getByRole('\${role}')\`;
  }

  // Fallback to CSS selector
  const tagName = el.tagName.toLowerCase();
  const id = el.id ? \`#\${el.id}\` : '';
  const classNames = el.className ? \`.\${el.className.split(' ').join('.')}\` : '';

  return \`locator('\${tagName}\${id}\${classNames}')\`;
};`;

export const showModal = `function showModal(options) {
      return new Promise((resolve) => {
        // Create or reuse style
        const styleId = 'modal-style';
        let style = document.getElementById(styleId);

        if (!style) {
          style = document.createElement('style');
          style.id = styleId;
          style.textContent = \`
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.5);
              z-index: 99999;
            }
            .modal {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 500px;
              padding: 20px;
              background: white;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              z-index: 100000;
            }
            .modal h3 {
              margin-top: 0;
            }
            .buttons {
              display: flex;
              justify-content: space-between;
              margin-top: 15px;
            }
            button {
              padding: 5px 10px;
            }
          \`;
          document.head.appendChild(style);
        }

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'modal';

        // Create modal content
        modal.innerHTML = \`
          <h3>Select an option</h3>
          <form id="modal-form">
            \${options
              .map(
                (option, index) => \`
              <label>
                <input type="radio" name="selection" value="\${option}" \${
                  index === 0 ? 'checked' : ''
                }>
                \${option}
              </label><br />
            \`
              )
              .join('')}
            <div class="buttons">
              <button type="button" id="cancel">Cancel</button>
              <button type="submit" id="submit">Submit</button>
            </div>
          </form>
        \`;

        // Append modal and overlay to body
        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // Event listeners
        const cancelButton = modal.querySelector('#cancel');
        const form = modal.querySelector('#modal-form');

        // Handle cancel button
        cancelButton.onclick = () => {
          closeModal();
          resolve(false);
        };

        // Handle form submission
        form.onsubmit = (event) => {
          event.preventDefault();
          const selectedOption = form.elements['selection'].value;
          closeModal();
          resolve(selectedOption);
        };

        // Cleanup function
        function closeModal() {
          document.body.removeChild(overlay);
          document.body.removeChild(modal);
        }
      });
    }`;

export const playwrightEventHandlers = `window.playwrightReplEventHandlers = {
  recordClick: async (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    evt.stopImmediatePropagation();
    const selector = recommendedLocator(evt.target);
    if (selector) {
      const possibleGoodSelectors = await window.getPossibleSelectors(\`\${selector}.click();\`);
      if (possibleGoodSelectors.length === 1) {
        window.sendToPlaywright(\`\${possibleGoodSelectors[0]}\`);
      } else if (possibleGoodSelectors.length > 1) {
        document.removeEventListener('mousedown', window.playwrightReplEventHandlers.recordClick);
        const answer = await showModal(possibleGoodSelectors);
        if (answer) {
          window.sendToPlaywright(\`\${answer}.click();\`);
        }
        document.addEventListener('mousedown', window.playwrightReplEventHandlers.recordClick);
      }
    }
  }
};`;

export const createRecordingDot = `const recordingDot = document.createElement("div");
recordingDot.style.position = "fixed";
recordingDot.style.top = "2px";
recordingDot.style.left = "2px";
recordingDot.style.width = "16px";
recordingDot.style.height = "16px";
recordingDot.style.background = "red";
recordingDot.style.zIndex = "100000";
recordingDot.style.borderRadius = "50%";
recordingDot.style.pointerEvents = "none";
recordingDot.setAttribute("id", "playwright-repl-recording-dot");
document.body.appendChild(recordingDot);
document.addEventListener('mousedown', window.playwrightReplEventHandlers.recordClick);`;

export const startRecordCode = `page.evaluate(() => {
  ${recommendedLocator}

  ${showModal}

  if (!document.getElementById('playwright-repl-recording-dot')) {
    ${playwrightEventHandlers}
    ${createRecordingDot}
  }
});`;

export const removeRecordCode = `page.evaluate(() => {
  const recordingDot = document.getElementById('playwright-repl-recording-dot');
  if (recordingDot) {
    document.body.removeChild(recordingDot);
  }
  if (window.playwrightReplEventHandlers) {
    document.removeEventListener('mousedown', window.playwrightReplEventHandlers.recordClick);
  }
});`;
