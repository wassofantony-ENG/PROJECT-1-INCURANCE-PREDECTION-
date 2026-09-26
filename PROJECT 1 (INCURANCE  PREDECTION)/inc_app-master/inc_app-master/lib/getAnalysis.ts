export function get_analysis(){
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/analysis`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("authToken")}`,
        },
        }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analysis");
        return res.json();
        });
}