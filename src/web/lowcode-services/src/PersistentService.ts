// How long to wait for the db before treating the local cache as unavailable.
// An open can stall indefinitely, e.g. blocked by another tab still holding an
// older version, and callers must not hang on it.
const OPEN_TIMEOUT = 3000;

export default class PersistentService {
  private opening: Promise<IDBDatabase>;

  private objectName: string;

  constructor(name: string) {
    this.objectName = name;
  }

  /**
   * Open the db, sharing one connection across calls
   * @returns
   */
  private open() {
    if (!this.opening) {
      this.opening = new Promise<IDBDatabase>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('indexedDB open timed out')), OPEN_TIMEOUT);
        const request = window.indexedDB.open('lowcode_designer', 2);
        request.onsuccess = () => {
          clearTimeout(timer);
          const db = request.result;
          // Let a newer version in another tab upgrade instead of blocking it.
          db.onversionchange = () => {
            db.close();
            this.opening = undefined;
          };
          resolve(db);
        };
        request.onerror = () => {
          clearTimeout(timer);
          reject(request.error);
        };
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.objectName)) {
            db.createObjectStore(this.objectName, {
              keyPath: 'id',
            });
          } else {
            // v1 indexed the full serialised page config, which made every save
            // rewrite a large index entry. Nothing queries by it, so drop it.
            const store = request.transaction.objectStore(this.objectName);
            if (store.indexNames.contains('data')) store.deleteIndex('data');
          }
        };
      });
      // Retry on the next call rather than caching the failure.
      this.opening.catch(() => {
        this.opening = undefined;
      });
    }
    return this.opening;
  }

  /**
   * Get data by id
   */
  async find<T>(id: string): Promise<T> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.objectName]);
      const objectStore = transaction.objectStore(this.objectName);
      const request = objectStore.get(id);
      request.onerror = reject;
      request.onsuccess = () => {
        try {
          resolve(request.result ? JSON.parse(request.result.data || '{}') : {});
        } catch (e) {
          reject(e);
        }
      };
    });
  }

  /**
   * Create or update the given record
   * @param data
   */
  async createOrUpdate(data: { id: string, data: any }) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.objectName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectName);
      const model = { id: data.id, data: JSON.stringify(data.data) };
      // put() inserts or replaces, so no prior read is needed.
      const request = objectStore.put(model);
      request.onerror = reject;
      request.onsuccess = resolve;
    });
  }

  /**
   * Delete the given record
   */
  async remove(id: string) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.objectName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectName);
      const request = objectStore.delete(id);
      request.onerror = reject;
      request.onsuccess = resolve;
    });
  }
}