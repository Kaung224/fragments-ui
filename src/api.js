const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function getUserFragments(user) {
  try {
    const fragmentsUrl = new URL("/v1/fragments", apiUrl);
    const res = await fetch(fragmentsUrl, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("User fragments:", data);
    return data;
  } catch (err) {
    console.error("Failed to fetch user fragments", err);
  }
}
