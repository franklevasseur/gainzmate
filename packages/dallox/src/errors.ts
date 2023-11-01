import { z } from 'zod'

export class FlowError extends Error {}
export class InfiniteLoopError extends FlowError {
  public constructor(public readonly nodeId: string) {
    super(`Node "${nodeId}" is not allowed to transition to itself without yielding first`)
  }
}
export class NodeNotFoundError extends FlowError {
  public constructor(public readonly nodeId: string) {
    super(`Node "${nodeId}" not found in the flow`)
  }
}
export class InvalidStateDataError extends FlowError {
  public constructor(public readonly nodeId: string, public readonly errors: z.ZodIssue[]) {
    super(`Cannot transition to node "${nodeId}" with invalid data: ${JSON.stringify(errors)}`)
  }
}
