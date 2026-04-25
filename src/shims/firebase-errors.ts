// Stub for "@/firebase/errors"
export class FirestorePermissionError extends Error {
  context: any;
  constructor(context?: any) {
    super(typeof context === "string" ? context : "FirestorePermissionError");
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
