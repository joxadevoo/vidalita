// Sync service for handling online/offline detection and auto-syncing

import api from './api'
import offlineStorage from './offlineStorage'

type SyncStatus = {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  pendingCount: number
}

class SyncService {
  private isOnline = navigator.onLine
  private isSyncing = false
  private syncInterval: number | null = null
  private listeners: ((status: SyncStatus) => void)[] = []

  constructor() {
    // Listen to online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners()
      this.sync()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners()
    })

    // Initialize offline storage
    offlineStorage.init().then(() => {
      // Start periodic sync if online
      if (this.isOnline) {
        this.startAutoSync()
        this.sync()
      }
    })
  }

  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.getLastSyncTime(),
      pendingCount: 0 // Will be updated async
    }
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    // Immediately notify with current status
    this.updatePendingCount().then(() => {
      listener(this.getStatus())
    })

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private async updatePendingCount(): Promise<void> {
    try {
      const [members, checkins, services] = await Promise.all([
        offlineStorage.getUnsyncedMembers(),
        offlineStorage.getUnsyncedCheckins(),
        offlineStorage.getUnsyncedBeautyServices()
      ])
      const pendingCount = members.length + checkins.length + services.length
      // Update status with pending count
      const status = this.getStatus()
      status.pendingCount = pendingCount
      this.notifyListeners(status)
    } catch (error) {
      console.error('Error updating pending count:', error)
    }
  }

  private notifyListeners(status?: SyncStatus): void {
    const currentStatus = status || this.getStatus()
    this.listeners.forEach(listener => listener(currentStatus))
  }

  private getLastSyncTime(): number | null {
    const lastSync = localStorage.getItem('lastSyncTime')
    return lastSync ? parseInt(lastSync, 10) : null
  }

  private setLastSyncTime(): void {
    localStorage.setItem('lastSyncTime', Date.now().toString())
  }

  startAutoSync(intervalMs: number = 30000): void {
    // Sync every 30 seconds when online
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync()
      }
    }, intervalMs)
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async sync(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return
    }

    this.isSyncing = true
    this.notifyListeners()

    try {
      // Sync members
      await this.syncMembers()

      // Sync checkins
      await this.syncCheckins()

      // Sync beauty services
      await this.syncBeautyServices()

      this.setLastSyncTime()
      await this.updatePendingCount()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      this.isSyncing = false
      this.notifyListeners()
    }
  }

  private async syncMembers(): Promise<void> {
    const unsyncedMembers = await offlineStorage.getUnsyncedMembers()

    for (const member of unsyncedMembers) {
      try {
        // Try to create or update member
        let response
        if (member.id && member.id > 0) {
          // Update existing member
          response = await api.put(`/members/${member.id}`, member)
        } else {
          // Create new member
          response = await api.post('/members', member)
        }

        if (response.data) {
          // Mark as synced
          const memberId = response.data.id || member.id
          await offlineStorage.updateMemberSyncStatus(memberId, true)
        }
      } catch (error: any) {
        // If member already exists on server, mark as synced
        if (error.response?.status === 400 || error.response?.status === 409) {
          await offlineStorage.updateMemberSyncStatus(member.id, true)
        } else {
          console.error('Failed to sync member:', member, error)
        }
      }
    }
  }

  private async syncCheckins(): Promise<void> {
    const unsyncedCheckins = await offlineStorage.getUnsyncedCheckins()

    for (const checkin of unsyncedCheckins) {
      try {
        const response = await api.post('/checkins', {
          qrCodeId: checkin.qrCodeId,
          verifiedBy: checkin.verifiedBy || 'system',
          date: checkin.date
        })

        if (response.data) {
          await offlineStorage.updateCheckinSyncStatus(checkin.id, true)
        }
      } catch (error) {
        console.error('Failed to sync checkin:', checkin, error)
      }
    }
  }

  private async syncBeautyServices(): Promise<void> {
    const unsyncedServices = await offlineStorage.getUnsyncedBeautyServices()

    for (const service of unsyncedServices) {
      try {
        const response = await api.post('/beauty', {
          memberId: service.memberId,
          serviceName: service.serviceName,
          serviceDate: service.serviceDate,
          note: service.note
        })

        if (response.data) {
          await offlineStorage.updateBeautyServiceSyncStatus(service.id, true)
        }
      } catch (error) {
        console.error('Failed to sync beauty service:', service, error)
      }
    }
  }

  // Manual sync trigger
  async forceSync(): Promise<void> {
    await this.sync()
  }
}

export const syncService = new SyncService()
export default syncService

