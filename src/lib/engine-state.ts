// Simple in-memory engine state manager
// In a real application, this would be stored in a database or Redis

interface EngineState {
  status: 'active' | 'inactive' | 'starting' | 'stopping'
  lastAction?: {
    action: 'start' | 'stop' | 'restart'
    timestamp: string
    userId: string
    userEmail: string
    reason?: string
  }
  uptime: number
  startTime?: number
}

let engineState: EngineState = {
  status: 'active',
  uptime: process.uptime(),
  startTime: Date.now() - (process.uptime() * 1000)
}

export const engineStateManager = {
  getState(): EngineState {
    return {
      ...engineState,
      uptime: engineState.startTime ? (Date.now() - engineState.startTime) / 1000 : 0
    }
  },

  setStatus(status: EngineState['status'], action?: EngineState['lastAction']) {
    engineState.status = status
    if (action) {
      engineState.lastAction = action
    }
    
    // Update start time for uptime calculation
    if (status === 'active' && !engineState.startTime) {
      engineState.startTime = Date.now()
    } else if (status === 'inactive') {
      engineState.startTime = undefined
    }
  },

  getStatus(): EngineState['status'] {
    return engineState.status
  },

  getLastAction(): EngineState['lastAction'] {
    return engineState.lastAction
  }
}
