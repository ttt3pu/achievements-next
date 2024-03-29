export async function fetchIsr<T>(endpoint: string) {
  const res = await fetch(process.env.NEXTAUTH_URL + endpoint, {
    next: { revalidate: 3600 },
  });

  return res.json() as T;
}

export async function fetchSsr<T>(endpoint: string) {
  const res = await fetch(process.env.NEXTAUTH_URL + endpoint);

  return res.json() as T;
}

export async function fetchSpa<T>(endpoint: string) {
  const res = await fetch(endpoint);

  return res.json() as T;
}
