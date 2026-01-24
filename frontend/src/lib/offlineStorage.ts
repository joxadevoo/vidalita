// IndexedDB storage utility for offline data management

const DB_NAME = 'VidalitaOfflineDB'
const DB_VERSION = 1

const STORES = {
  MEMBERS: 'members',
  CHECKINS: 'checkins',
  BEAUTY_SERVICES: 'beauty_services',
  SYNC_QUEUE: 'sync_queue'
}

type SyncOperation = {
  id?: number
  type: 'create' | 'update' | 'delete'
  entity: 'member' | 'checkin' | 'beauty'
  data: any
  timestamp: number
  synced: number
}

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Members store
        if (!db.objectStoreNames.contains(STORES.MEMBERS)) {
          const membersStore = db.createObjectStore(STORES.MEMBERS, { keyPath: 'id', autoIncrement: true })
          membersStore.createIndex('qrCodeId', 'qrCodeId', { unique: true })
          membersStore.createIndex('synced', 'synced', { unique: false })
        }

        // Checkins store
        if (!db.objectStoreNames.contains(STORES.CHECKINS)) {
          const checkinsStore = db.createObjectStore(STORES.CHECKINS, { keyPath: 'id', autoIncrement: true })
          checkinsStore.createIndex('memberId', 'memberId', { unique: false })
          checkinsStore.createIndex('synced', 'synced', { unique: false })
        }

        // Beauty services store
        if (!db.objectStoreNames.contains(STORES.BEAUTY_SERVICES)) {
          const beautyStore = db.createObjectStore(STORES.BEAUTY_SERVICES, { keyPath: 'id', autoIncrement: true })
          beautyStore.createIndex('memberId', 'memberId', { unique: false })
          beautyStore.createIndex('synced', 'synced', { unique: false })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true })
          queueStore.createIndex('synced', 'synced', { unique: false })
          queueStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  // Members operations
  async saveMember(member: any): Promise<number> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MEMBERS], 'readwrite')
      const store = transaction.objectStore(STORES.MEMBERS)
      const request = store.put({ ...member, synced: member.synced || 0 })

      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getMembers(): Promise<any[]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MEMBERS], 'readonly')
      const store = transaction.objectStore(STORES.MEMBERS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedMembers(): Promise<any[]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MEMBERS], 'readonly')
      const store = transaction.objectStore(STORES.MEMBERS)
      const index = store.index('synced')
      const request = index.getAll(0)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateMemberSyncStatus(id: number, synced: boolean): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MEMBERS], 'readwrite')
      const store = transaction.objectStore(STORES.MEMBERS)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const member = getRequest.result
        if (member) {
          member.synced = synced ? 1 : 0
          const putRequest = store.put(member)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Checkins operations
  async saveCheckin(checkin: any): Promise<number> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CHECKINS], 'readwrite')
      const store = transaction.objectStore(STORES.CHECKINS)
      const request = store.put({ ...checkin, synced: checkin.synced || 0 })

      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedCheckins(): Promise<any[]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CHECKINS], 'readonly')
      const store = transaction.objectStore(STORES.CHECKINS)
      const index = store.index('synced')
      const request = index.getAll(0)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateCheckinSyncStatus(id: number, synced: boolean): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CHECKINS], 'readwrite')
      const store = transaction.objectStore(STORES.CHECKINS)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const checkin = getRequest.result
        if (checkin) {
          checkin.synced = synced ? 1 : 0
          const putRequest = store.put(checkin)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Beauty services operations
  async saveBeautyService(service: any): Promise<number> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.BEAUTY_SERVICES], 'readwrite')
      const store = transaction.objectStore(STORES.BEAUTY_SERVICES)
      const request = store.put({ ...service, synced: service.synced || 0 })

      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedBeautyServices(): Promise<any[]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.BEAUTY_SERVICES], 'readonly')
      const store = transaction.objectStore(STORES.BEAUTY_SERVICES)
      const index = store.index('synced')
      const request = index.getAll(0)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateBeautyServiceSyncStatus(id: number, synced: boolean): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.BEAUTY_SERVICES], 'readwrite')
      const store = transaction.objectStore(STORES.BEAUTY_SERVICES)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const service = getRequest.result
        if (service) {
          service.synced = synced ? 1 : 0
          const putRequest = store.put(service)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Sync queue operations
  async addToSyncQueue(operation: SyncOperation): Promise<number> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite')
      const store = transaction.objectStore(STORES.SYNC_QUEUE)
      const request = store.add({
        ...operation,
        synced: 0,
        timestamp: Date.now()
      })

      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readonly')
      const store = transaction.objectStore(STORES.SYNC_QUEUE)
      const index = store.index('synced')
      const request = index.getAll(0)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markQueueItemSynced(id: number): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite')
      const store = transaction.objectStore(STORES.SYNC_QUEUE)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.synced = 1
          const putRequest = store.put(item)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async clearSyncedQueueItems(): Promise<void> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite')
      const store = transaction.objectStore(STORES.SYNC_QUEUE)
      const index = store.index('synced')
      const request = index.openCursor(IDBKeyRange.only(1))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()
export default offlineStorage

