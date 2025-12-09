import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { authClient } from "@/lib/auth-client"; // Assuming you need this for headers

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    
    // 💡 FIX: Keep the cached data fresh for 5 minutes (300,000 milliseconds)
    // If the user navigates back within this time, no re-fetch will occur.
    staleTime: 1000 * 60 * 5, // 5 minutes 

    queryFn: async () => {
      // Add authentication headers to the query function
      const session = await authClient.getSession();
      const userId = session.data?.user?.id;

      if (!userId) {
        throw new Error("User not authenticated to fetch tags.");
      }
      
      const { data } = await axios.get("http://localhost:8080/api/tags", {
        headers: {
          "X-User-Id": userId,
        },
      });
      return data;
    },
  });
}