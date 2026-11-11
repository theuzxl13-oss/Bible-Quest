import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

// jsdom não implementa scrollTo
window.scrollTo = (() => {}) as typeof window.scrollTo

// Com todos os arquivos rodando em paralelo, a máquina pode ficar lenta;
// damos mais margem às esperas assíncronas.
configure({ asyncUtilTimeout: 5000 })
