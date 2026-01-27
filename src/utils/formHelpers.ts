/**
 * Shared form validation and interaction utilities
 * Reduces duplication across form components
 */

/**
 * Display an error message for a specific form field
 */
export function showFieldError(fieldId: string, message: string): void {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}

/**
 * Hide the error message for a specific form field
 */
export function hideFieldError(fieldId: string): void {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.classList.add("hidden");
  }
}

/**
 * Set a button's loading state with loading text
 */
export function setButtonLoading(
  button: HTMLButtonElement,
  loading: boolean,
  loadingText: string = "Wird gesendet..."
): void {
  button.disabled = loading;
  if (loading) {
    button.dataset.originalText = button.textContent || "";
    button.textContent = loadingText;
  } else {
    button.textContent = button.dataset.originalText || "Submit";
  }
}

/**
 * Submit form data to an API endpoint
 */
export async function submitFormData(url: string, data: Record<string, any>): Promise<any> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Show a success message in a form
 */
export function showSuccessMessage(messageId: string, message: string): void {
  const messageElement = document.getElementById(messageId);
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.classList.remove("hidden");
  }
}

/**
 * Hide a success message in a form
 */
export function hideSuccessMessage(messageId: string): void {
  const messageElement = document.getElementById(messageId);
  if (messageElement) {
    messageElement.classList.add("hidden");
  }
}

/**
 * Reset a form and clear all error/success messages
 */
export function resetForm(
  form: HTMLFormElement,
  errorIds: string[] = [],
  successIds: string[] = []
): void {
  form.reset();
  errorIds.forEach(hideFieldError);
  successIds.forEach(hideSuccessMessage);
}
