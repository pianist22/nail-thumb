export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 2
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries <= 0) throw err;

    // Retry only on connection errors
    if (
      err?.code === "P1001" ||
      err?.message?.includes("Can't reach database server")
    ) {
      await new Promise((r) => setTimeout(r, 1000));
      return withDbRetry(fn, retries - 1);
    }

    throw err;
  }
}
