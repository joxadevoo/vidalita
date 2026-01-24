import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import offlineStorage from './offlineStorage'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Request interceptor to handle offline mode
api.interceptors.request.use(
  async (config) => {
    // If offline, store request in IndexedDB for later sync
    if (!navigator.onLine) {
      // Store request in sync queue
      await offlineStorage.init()
      await offlineStorage.addToSyncQueue({
        type: config.method === 'post' ? 'create' : config.method === 'put' ? 'update' : 'delete',
        entity: getEntityFromUrl(config.url || ''),
        data: config.data,
        timestamp: Date.now(),
        synced: 0
      })

      // Return a rejected promise to prevent the request
      return Promise.reject(new Error('OFFLINE'))
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle sync status
api.interceptors.response.use(
  (response) => {
    // If response includes sync status, update local storage
    if (response.data && response.data.id) {
      updateLocalSyncStatus(response.config, response.data.id, true)
    }
    return response
  },
  async (error: AxiosError) => {
    // If offline, queue the request
    if (!navigator.onLine && error.config) {
      await offlineStorage.init()
      await offlineStorage.addToSyncQueue({
        type: error.config.method === 'post' ? 'create' : error.config.method === 'put' ? 'update' : 'delete',
        entity: getEntityFromUrl(error.config.url || ''),
        data: error.config.data,
        timestamp: Date.now(),
        synced: 0
      })
    }
    return Promise.reject(error)
  }
)

function getEntityFromUrl(url: string): 'member' | 'checkin' | 'beauty' {
  if (url.includes('/members')) return 'member'
  if (url.includes('/checkins')) return 'checkin'
  if (url.includes('/beauty')) return 'beauty'
  return 'member' // default
}

async function updateLocalSyncStatus(config: AxiosRequestConfig, id: number, synced: boolean): Promise<void> {
  try {
    await offlineStorage.init()
    const entity = getEntityFromUrl(config.url || '')

    if (entity === 'member') {
      await offlineStorage.updateMemberSyncStatus(id, synced)
    } else if (entity === 'checkin') {
      await offlineStorage.updateCheckinSyncStatus(id, synced)
    } else if (entity === 'beauty') {
      await offlineStorage.updateBeautyServiceSyncStatus(id, synced)
    }
  } catch (error) {
    console.error('Error updating sync status:', error)
  }
}

export default api




