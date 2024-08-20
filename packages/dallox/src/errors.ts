import { z } from '@botpress/sdk'

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
  public constructor(
    public readonly nodeId: string,
    public readonly error: z.ZodError,
  ) {
    super(`Cannot transition to node "${nodeId}" with invalid data: ${error.toString()}`)
  }
}

export class NodeNotImplementedError extends FlowError {
  public constructor(public readonly nodeId: string) {
    super(`Node "${nodeId}" is not implemented`)
  }
}

export class NodeAlreadyImplementedError extends FlowError {
  public constructor(public readonly nodeId: string) {
    super(`Node "${nodeId}" is already implemented`)
  }
}

export class NoStartNodeDefined extends FlowError {
  public constructor() {
    super('Start node is undefined')
  }
}

export class StartNodeConflict extends FlowError {
  public constructor() {
    super('Start node is already defined')
  }
}

export class NodeIdConflictError extends FlowError {
  public constructor(public readonly nodeId: string) {
    super(`Node "${nodeId}" already exists`)
  }
}
