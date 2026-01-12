import { wrap, type Remote } from 'comlink';
import type { CalculatorWorkerAPI } from '../workers/calculator.worker';

let workerAPI: Remote<CalculatorWorkerAPI> | null = null;

/**
 * Get or create the calculator worker API
 * This provides access to the "backend" running in a Web Worker
 */
export async function getWorkerAPI(): Promise<Remote<CalculatorWorkerAPI>> {
  if (!workerAPI) {
    const worker = new Worker(
      new URL('../workers/calculator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerAPI = wrap<CalculatorWorkerAPI>(worker);
  }

  return workerAPI;
}

/**
 * Terminate the worker (cleanup)
 */
export function terminateWorker(): void {
  if (workerAPI) {
    // @ts-ignore - Comlink proxies have a [releaseProxy] method
    workerAPI[Symbol.for('comlink.releaseProxy')]();
    workerAPI = null;
  }
}
