export type MultiDrawRenderItem = { start: number; count: number; z: number; zSort?: number; index?: number };

/**
 * A class that creates and manages a list of render items, used to determine the rendering order based on depth.
 * @internal
 */
export class MultiDrawRenderList {
  public array: MultiDrawRenderItem[] = [];
  protected pool: MultiDrawRenderItem[] = [];

  public push(instanceId: number, depth: number, start: number, count: number): void {
    const pool = this.pool;
    const list = this.array;
    const index = list.length;

    if (index >= pool.length) {
      pool.push({ start: null, count: null, z: null, zSort: null, index: null });
    }

    const item = pool[index];
    item.index = instanceId;
    item.start = start;
    item.count = count;
    item.z = depth;

    list.push(item);
  }

  public reset(): void {
    this.array.length = 0;
  }
}
