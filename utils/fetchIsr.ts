export async function fetchIsr<T>(endpoint: string) {
  const res = await fetch(process.env.NEXTAUTH_URL + endpoint, {
    next: { revalidate: 3600 },
  });

  return res.json() as T;
}
