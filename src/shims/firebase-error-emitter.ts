// Stub for "@/firebase/error-emitter"
type Listener = (...args: any[]) => void;
class Emitter {
  private map = new Map<string, Set<Listener>>();
  on(event: string, listener: Listener) {
    if (!this.map.has(event)) this.map.set(event, new Set());
    this.map.get(event)!.add(listener);
  }
  off(event: string, listener: Listener) {
    this.map.get(event)?.delete(listener);
  }
  emit(event: string, ...args: any[]) {
    this.map.get(event)?.forEach((l) => l(...args));
  }
}
export const errorEmitter = new Emitter();
