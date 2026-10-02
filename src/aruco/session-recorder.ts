import { Paths, File, Directory } from 'expo-file-system';
import { SessionFrame, RecordingSession } from './types';

export class SessionRecorder {
  private currentSession: RecordingSession | null = null;
  private sessionsDir: Directory;

  constructor() {
    this.sessionsDir = new Directory(Paths.document, 'aruco_sessions');
    this.ensureDirectory();
  }

  private ensureDirectory() {
    if (!this.sessionsDir.exists) {
      this.sessionsDir.create();
    }
  }

  public startSession(): string {
    const id = Date.now().toString();
    this.currentSession = {
      id,
      startedAt: Date.now(),
      frames: [],
    };
    return id;
  }

  public addFrame(frame: SessionFrame) {
    if (this.currentSession) {
      this.currentSession.frames.push(frame);
    }
  }

  public stopAndSaveSession(): string | null {
    if (!this.currentSession) return null;

    this.ensureDirectory();
    const file = new File(this.sessionsDir, `${this.currentSession.id}.json`);
    file.write(JSON.stringify(this.currentSession));

    const id = this.currentSession.id;
    this.currentSession = null;
    return id;
  }

  public async loadSession(id: string): Promise<RecordingSession | null> {
    const file = new File(this.sessionsDir, `${id}.json`);
    if (!file.exists) return null;
    const content = await file.text();
    return JSON.parse(content) as RecordingSession;
  }

  public deleteSession(id: string): void {
    const file = new File(this.sessionsDir, `${id}.json`);
    if (file.exists) {
      file.delete();
    }
  }

  public getSessionIds(): string[] {
    this.ensureDirectory();
    const entries = this.sessionsDir.list();
    return entries
      .filter((entry): entry is File => entry instanceof File)
      .filter((f) => f.name.endsWith('.json'))
      .map((f) => f.name.replace('.json', ''));
  }

  public async exportSessionAsJson(id: string): Promise<string | null> {
    const session = await this.loadSession(id);
    if (!session) return null;
    return JSON.stringify(session, null, 2);
  }

  public getAvailableStorageBytes(): number {
    return Paths.availableDiskSpace;
  }
}
