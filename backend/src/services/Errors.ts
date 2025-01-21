export class RecordNotFoundError extends Error {
  constructor(resource: string, id: number) {
    super(`${resource} with id ${id} not found`);
    this.name = "RecordNotFoundError";
  }
}
