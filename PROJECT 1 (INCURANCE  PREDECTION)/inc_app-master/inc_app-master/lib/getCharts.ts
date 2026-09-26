import { ChartsData } from "@/types/analysis";

export function getCharts(): Promise<ChartsData> {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/analysis/charts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.localStorage.getItem("authToken")}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch chart data");
    return res.json();
  });
}
