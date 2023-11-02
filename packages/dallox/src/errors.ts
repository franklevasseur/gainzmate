import { z } from 'zod'

export class FlowError extends Error {}
export class InfiniteLoopError extends FlowError {
  public constructor(public readonly nodeId: number) {
    super(`Node "${nodeId}" is not allowed to transition to itself without yielding first`)
  }
}
export class NodeNotFoundError extends FlowError {
  public constructor(public readonly nodeId: number) {
    super(`Node "${nodeId}" not found in the flow`)
  }
}
export class InvalidStateDataError extends FlowError {
  public constructor(public readonly nodeId: number, public readonly error: z.ZodError) {
    super(`Cannot transition to node "${nodeId}" with invalid data: ${error.toString()}`)
  }
}
