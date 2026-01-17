import { AsyncLocalStorage } from 'async_hooks';

export type RequestContextStore = {
  requestId: string;
  method?: string;
  path?: string;
};

export class RequestContext {
  private static storage = new AsyncLocalStorage<RequestContextStore>();

  static run(store: RequestContextStore, callback: () => void) {
    RequestContext.storage.run(store, callback);
  }

  static getStore(): RequestContextStore | undefined {
    return RequestContext.storage.getStore();
  }

  static getRequestId(): string | null {
    return RequestContext.storage.getStore()?.requestId ?? null;
  }
}
