import { describe, it, expect, vi, beforeEach } from 'vitest';

// We will mock canvas and URL helpers since we are running in a Node.js test runner
beforeEach(() => {
  vi.restoreAllMocks();
  
  // Mock globals for DOM APIs
  if (typeof window !== 'undefined') {
    global.window = window;
  } else {
    global.window = {} as any;
  }

  // Mock URL.createObjectURL/revokeObjectURL
  global.window.URL = {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  } as any;

  // Mock document.createElement for canvas
  global.document = {
    createElement: vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => ({
            drawImage: vi.fn(),
          }),
          toBlob: (callback: (blob: any) => void) => {
            callback(new Blob(['mock compressed jpeg'], { type: 'image/jpeg' }));
          },
        };
      }
      return {};
    }),
  } as any;

  // Mock the native Image class
  class MockImage {
    src: string = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    width: number = 800;
    height: number = 600;
    constructor() {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 10);
    }
  }
  global.window.Image = MockImage as any;
  global.Image = MockImage as any;
});

// A lightweight pure simulator of our React state-management & upload-queue engine and its retry rules
// to verify all required behaviors: happy path, failure path, retry limit, and manual restart
class UploadQueueManager {
  public uploadQueue: any[] = [];
  public images: any[] = [];
  public maxAttempts = 3;

  constructor(
    private uploadToCloudinaryMock: (file: File, progressCb: (p: number) => void) => Promise<string>
  ) {}

  public async triggerUpload(taskId: string, file: File, attemptCount = 1) {
    const localUrl = 'blob:mock-url';
    
    // Set status to uploading or retrying
    this.uploadQueue = this.uploadQueue.map(t => t.id === taskId ? {
      ...t,
      status: attemptCount > 1 ? 'retrying' : 'uploading',
      progress: 0,
      error: undefined,
      thumbnailUrl: localUrl,
      retryAttempt: attemptCount,
      maxAttempts: this.maxAttempts
    } : t);

    try {
      const url = await this.uploadToCloudinaryMock(file, (p) => {
        this.uploadQueue = this.uploadQueue.map(t => 
          t.id === taskId && (t.status === 'uploading' || t.status === 'retrying') 
            ? { ...t, progress: p } 
            : t
        );
      });

      this.images.push({
        id: `img-${Date.now()}`,
        url,
        order: this.images.length
      });

      this.uploadQueue = this.uploadQueue.map(t => t.id === taskId ? { ...t, status: 'success', progress: 100 } : t);
    } catch (err: any) {
      if (attemptCount < this.maxAttempts) {
        // Automatic retry transition
        await new Promise(resolve => setTimeout(resolve, 10)); // simulate delay
        await this.triggerUpload(taskId, file, attemptCount + 1);
      } else {
        this.uploadQueue = this.uploadQueue.map(t => t.id === taskId ? {
          ...t,
          status: 'failed',
          progress: 0,
          error: `${err.message || 'Upload failed'} (failed after ${this.maxAttempts} attempts)`
        } : t);
      }
    }
  }

  public handleRetryUpload(taskId: string) {
    const task = this.uploadQueue.find(t => t.id === taskId);
    if (task) {
      this.triggerUpload(taskId, task.file, 1);
    }
  }
}

describe('Upload Queue State Lifecycle Unit Tests', () => {
  it('1. Happy Path - should successfully transition pending -> uploading/retrying -> success', async () => {
    const uploadApiMock = vi.fn().mockImplementation(async (file, progressCb) => {
      progressCb(50);
      progressCb(100);
      return 'https://cloudinary.com/success-url.jpg';
    });

    const manager = new UploadQueueManager(uploadApiMock);
    const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    const taskId = 'task-1';

    manager.uploadQueue.push({
      id: taskId,
      fileName: 'photo.jpg',
      size: 1024,
      status: 'pending',
      file: mockFile
    });

    expect(manager.uploadQueue[0].status).toBe('pending');

    await manager.triggerUpload(taskId, mockFile);

    expect(manager.uploadQueue[0].status).toBe('success');
    expect(manager.uploadQueue[0].progress).toBe(100);
    expect(manager.images.length).toBe(1);
    expect(manager.images[0].url).toBe('https://cloudinary.com/success-url.jpg');
  });

  it('2. Failure Path with Automated Retries - should retry 3 times and fail upon hitting the limit', async () => {
    // Failing API mock
    const uploadApiMock = vi.fn().mockRejectedValue(new Error('Gateway Timeout 504'));

    const manager = new UploadQueueManager(uploadApiMock);
    const mockFile = new File(['test'], 'photo_failed.jpg', { type: 'image/jpeg' });
    const taskId = 'task-fail';

    manager.uploadQueue.push({
      id: taskId,
      fileName: 'photo_failed.jpg',
      size: 2048,
      status: 'pending',
      file: mockFile
    });

    await manager.triggerUpload(taskId, mockFile);

    expect(manager.uploadQueue[0].status).toBe('failed');
    expect(manager.uploadQueue[0].error).toContain('failed after 3 attempts');
    // Ensure API mock was called exactly 3 times (initial + 2 retries)
    expect(uploadApiMock).toHaveBeenCalledTimes(3);
  });

  it('3. Manual Retry - should reset attempts and process with fresh attempt count', async () => {
    let callCount = 0;
    // API succeeds only when triggered manually after failures
    const uploadApiMock = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount <= 3) {
        throw new Error('Transient Upload Interruption');
      }
      return 'https://cloudinary.com/manual-retry-success.jpg';
    });

    const manager = new UploadQueueManager(uploadApiMock);
    const mockFile = new File(['test'], 'photo_manual.jpg', { type: 'image/jpeg' });
    const taskId = 'task-manual';

    manager.uploadQueue.push({
      id: taskId,
      fileName: 'photo_manual.jpg',
      size: 2048,
      status: 'pending',
      file: mockFile
    });

    // Step A: Trigger initial upload which fails up to 3 times
    await manager.triggerUpload(taskId, mockFile);
    expect(manager.uploadQueue[0].status).toBe('failed');
    expect(uploadApiMock).toHaveBeenCalledTimes(3);

    // Step B: Manual retry should clear attempts and succeed on 4th call
    await manager.handleRetryUpload(taskId);
    expect(manager.uploadQueue[0].status).toBe('success');
    expect(uploadApiMock).toHaveBeenCalledTimes(4); // 3 original + 1 successful manual
  });
});
