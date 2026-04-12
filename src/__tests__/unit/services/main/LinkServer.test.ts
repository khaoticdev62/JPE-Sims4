import net from 'net'
import { LinkServer } from '@/services/main/LinkServer'
import { BrowserWindow } from 'electron'

// Mock net module
jest.mock('net')

describe('LinkServer', () => {
  let mockWindow: any
  let linkServer: LinkServer
  let mockServer: any
  let mockSocket: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockWindow = {
      isDestroyed: jest.fn().mockReturnValue(false),
      webContents: {
        send: jest.fn()
      }
    }

    mockSocket = {
      on: jest.fn(),
      write: jest.fn(),
      destroy: jest.fn(),
      remoteAddress: '127.0.0.1'
    }

    mockServer = {
      listen: jest.fn((port, host, cb) => cb()),
      on: jest.fn(),
      close: jest.fn()
    }

    ;(net.createServer as jest.Mock).mockReturnValue(mockServer)

    linkServer = new LinkServer(mockWindow as unknown as BrowserWindow)
  })

  it('should start the server on port 9988', () => {
    linkServer.start()
    expect(net.createServer).toHaveBeenCalled()
    expect(mockServer.listen).toHaveBeenCalledWith(9988, '127.0.0.1', expect.any(Function))
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('sync:status', expect.objectContaining({ status: 'listening' }))
  })

  it('should broadcast status to renderer when a new connection is made', () => {
    linkServer.start()
    
    // Simulate a new connection
    const connectionHandler = (net.createServer as jest.Mock).mock.calls[0][0]
    connectionHandler(mockSocket)

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('sync:status', expect.objectContaining({ status: 'connected' }))
  })

  it('should parse incoming JSON messages and broadcast them', () => {
    linkServer.start()
    const connectionHandler = (net.createServer as jest.Mock).mock.calls[0][0]
    connectionHandler(mockSocket)

    // Simulate data event
    const dataHandler = mockSocket.on.mock.calls.find((c: any) => c[0] === 'data')[1]
    const testEvent = { type: 'HEARTBEAT', payload: { version: '1.0' } }
    dataHandler(Buffer.from(JSON.stringify(testEvent) + '\n'))

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('sync:event', testEvent)
  })

  it('should trigger sensory feedback on EXCEPTION events', () => {
    linkServer.start()
    const connectionHandler = (net.createServer as jest.Mock).mock.calls[0][0]
    connectionHandler(mockSocket)

    const dataHandler = mockSocket.on.mock.calls.find((c: any) => c[0] === 'data')[1]
    const exceptionEvent = { type: 'EXCEPTION', payload: { error: 'Broken mod' } }
    dataHandler(Buffer.from(JSON.stringify(exceptionEvent) + '\n'))

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('sensory:trigger', 'error-fail', expect.any(Object))
  })

  it('should clean up on stop', () => {
    linkServer.start()
    
    // Connect one socket
    const connectionHandler = (net.createServer as jest.Mock).mock.calls[0][0]
    connectionHandler(mockSocket)

    linkServer.stop()
    expect(mockSocket.destroy).toHaveBeenCalled()
    expect(mockServer.close).toHaveBeenCalled()
  })
})
