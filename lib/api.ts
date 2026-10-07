export const serverUrl = () => process.env.NEXT_PUBLIC_SERVER_URL ?? `http://${window.location.hostname}:4000`;

export async function api<T>(path: string, body?: unknown, method = 'POST'): Promise<T> {
  let res: Response;
  try {
    res = await fetch(serverUrl() + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Không kết nối được máy chủ. Hãy kiểm tra server đã chạy chưa.');
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Có lỗi xảy ra.');
  return data as T;
}
