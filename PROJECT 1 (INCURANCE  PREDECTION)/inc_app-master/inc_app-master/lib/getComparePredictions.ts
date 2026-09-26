import { ComparePredictions, PredictionForm } from "@/types/client";

export async function getComparePredictions(
  data: PredictionForm
): Promise<ComparePredictions> {
  const token = window.localStorage.getItem("authToken");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/compare`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Failed to fetch compare predictions");
  return res.json();
}
