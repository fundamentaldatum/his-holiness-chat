/**
 * Find an input element by placeholder text
 * @param placeholder - Placeholder text to search for
 * @returns HTMLInputElement or null if not found
 */
export function findInputByPlaceholder(placeholder: string): HTMLInputElement | null {
  const inputs = document.querySelectorAll('input');
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i] as HTMLInputElement;
    if (input.placeholder === placeholder) {
      return input;
    }
  }
  return null;
}

/**
 * Set the value of an input element and trigger input event
 * @param input - Input element
 * @param value - Value to set
 */
export function setInputValueAndTriggerEvent(input: HTMLInputElement, value: string): void {
  // Set the value
  input.value = value;
  
  // Focus the input
  input.focus();
  
  // Dispatch an input event to ensure React's state is updated
  const inputEvent = new Event('input', { bubbles: true });
  input.dispatchEvent(inputEvent);
  
  // Dispatch a change event for good measure
  const changeEvent = new Event('change', { bubbles: true });
  input.dispatchEvent(changeEvent);
}

/**
 * Lock scroll position to prevent jumping
 * @param position - Scroll position to lock to
 */
export function lockScrollPosition(position: number): void {
  document.body.classList.add('input-focused');
  window.scrollTo(0, position);
}

/**
 * Unlock scroll position
 */
export function unlockScrollPosition(): void {
  document.body.classList.remove('input-focused');
}

/**
 * Calculate adjusted scroll position to keep an element visible
 * @param element - Element to keep visible
 * @param headerHeight - Height of the header
 * @param padding - Additional padding
 * @returns Adjusted scroll position
 */
export function calculateAdjustedScrollPosition(
  element: HTMLElement,
  headerHeight: number = 60,
  padding: number = 20
): number {
  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY;
  const elementTop = rect.top + scrollY;
  
  return Math.max(0, elementTop - headerHeight - padding);
}

/**
 * Smooth scroll to an element
 * @param element - Element to scroll to
 * @param offset - Offset from the top of the element
 */
export function smoothScrollToElement(element: HTMLElement, offset: number = 0): void {
  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY;
  const elementTop = rect.top + scrollY;
  
  window.scrollTo({
    top: elementTop - offset,
    behavior: 'smooth'
  });
}

/**
 * Check if an element is in the viewport
 * @param element - Element to check
 * @param fullyVisible - Whether the element should be fully visible
 * @returns Whether the element is in the viewport
 */
export function isElementInViewport(element: HTMLElement, fullyVisible: boolean = false): boolean {
  const rect = element.getBoundingClientRect();
  
  if (fullyVisible) {
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  } else {
    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= window.innerHeight &&
      rect.left <= window.innerWidth
    );
  }
}

/**
 * Get the distance of an element from the bottom of the viewport
 * @param element - Element to check
 * @returns Distance from the bottom of the viewport
 */
export function getDistanceFromBottom(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return window.innerHeight - rect.bottom;
}

/**
 * Add a class to an element temporarily
 * @param element - Element to add class to
 * @param className - Class to add
 * @param duration - Duration in milliseconds
 */
export function addTemporaryClass(element: HTMLElement, className: string, duration: number): void {
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}
