// Stub for "@/firebase/errors"
export class FirestorePermissionError extends Error {
  context?: any;
  constructor(message: string, context?: any) {
    super(message);
    this.name = "FirestorePermissionError";
    this.context = context;
  }
}
export class FirebaseError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "FirebaseError";
    this.code = code;
  }
}
