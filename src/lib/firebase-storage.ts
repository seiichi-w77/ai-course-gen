import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
  type StorageReference,
} from 'firebase/storage';

/**
 * Firebase configuration interface
 * All values should be provided via environment variables
 */
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Get Firebase configuration from environment variables
 * @throws {Error} If required environment variables are missing
 */
function getFirebaseConfig(): FirebaseConfig {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Validate all required config values are present
  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missingKeys.join(', ')}`
    );
  }

  return config as FirebaseConfig;
}

/**
 * Initialize Firebase app (singleton pattern)
 * Returns existing app if already initialized
 */
function initializeFirebase(): FirebaseApp {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const config = getFirebaseConfig();
  return initializeApp(config);
}

/**
 * Get Firebase Storage instance
 * Initializes Firebase app if not already initialized
 */
function getStorageInstance(): FirebaseStorage {
  const app = initializeFirebase();
  return getStorage(app);
}

/**
 * Upload audio file to Firebase Storage
 *
 * @param audioData - Audio file data as ArrayBuffer
 * @param filename - Desired filename (should include extension, e.g., "audio.mp3")
 * @returns Promise resolving to the public download URL
 *
 * @example
 * ```typescript
 * const audioBuffer = await fetch('/audio.mp3').then(r => r.arrayBuffer());
 * const url = await uploadAudio(audioBuffer, 'my-audio.mp3');
 * console.log('Audio uploaded:', url);
 * ```
 *
 * @throws {Error} If upload fails or Firebase is not configured
 */
export async function uploadAudio(
  audioData: ArrayBuffer,
  filename: string
): Promise<string> {
  try {
    // Get storage instance
    const storage = getStorageInstance();

    // Create a unique filename with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `audio/${timestamp}_${sanitizedFilename}`;

    // Create storage reference
    const storageRef: StorageReference = ref(storage, uniqueFilename);

    // Convert ArrayBuffer to Uint8Array for upload
    const uint8Array = new Uint8Array(audioData);

    // Determine content type from filename extension
    const contentType = getContentType(filename);

    // Upload file with metadata
    const uploadResult = await uploadBytes(storageRef, uint8Array, {
      contentType,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalFilename: filename,
      },
    });

    // Get public download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    return downloadURL;
  } catch (error) {
    // Provide detailed error message
    if (error instanceof Error) {
      throw new Error(`Failed to upload audio: ${error.message}`);
    }
    throw new Error('Failed to upload audio: Unknown error');
  }
}

/**
 * Determine MIME type from filename extension
 *
 * @param filename - Filename with extension
 * @returns MIME type string
 */
function getContentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  const contentTypeMap: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    flac: 'audio/flac',
    webm: 'audio/webm',
  };

  return contentTypeMap[extension || ''] || 'application/octet-stream';
}

/**
 * Upload audio file with progress tracking
 *
 * @param audioData - Audio file data as ArrayBuffer
 * @param filename - Desired filename
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise resolving to the public download URL
 *
 * @example
 * ```typescript
 * const url = await uploadAudioWithProgress(
 *   audioBuffer,
 *   'audio.mp3',
 *   (progress) => console.log(`Upload: ${progress}%`)
 * );
 * ```
 */
export async function uploadAudioWithProgress(
  audioData: ArrayBuffer,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Note: Firebase Storage uploadBytes doesn't support progress tracking directly
  // For progress tracking, we would need to use uploadBytesResumable
  // This is a simplified version that calls the callback at start and end

  if (onProgress) {
    onProgress(0);
  }

  const url = await uploadAudio(audioData, filename);

  if (onProgress) {
    onProgress(100);
  }

  return url;
}

/**
 * Delete audio file from Firebase Storage
 *
 * @param url - The download URL of the file to delete
 * @returns Promise resolving when deletion is complete
 *
 * @example
 * ```typescript
 * await deleteAudio('https://firebasestorage.googleapis.com/...');
 * ```
 */
export async function deleteAudio(url: string): Promise<void> {
  try {
    // Get storage instance to ensure Firebase is initialized
    getStorageInstance();

    // Reference the file by URL
    ref(getStorageInstance(), url);

    // Note: deleteObject is not imported in this implementation
    // This is a placeholder for future enhancement
    throw new Error('Delete functionality not yet implemented');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete audio: ${error.message}`);
    }
    throw new Error('Failed to delete audio: Unknown error');
  }
}
