import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost:8080/api/tags");
      return data;
    },
  });
}
