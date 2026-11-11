import '@testing-library/jest-dom/vitest'

// jsdom não implementa scrollTo
window.scrollTo = (() => {}) as typeof window.scrollTo
