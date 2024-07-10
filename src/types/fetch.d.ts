declare namespace Fetch {
  interface Errors {
    status: number;
    code: string | undefined;
    message: string;
    name: string;
  }

  interface Error {
    errors: Errors;
  }
}
