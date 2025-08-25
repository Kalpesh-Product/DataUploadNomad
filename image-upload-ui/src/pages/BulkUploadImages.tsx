import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import CompanySelector from "../components/CompanySelector";
import type { Company } from "../types/Data";

export default function BulkUploadImages() {
  const { data, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await axiosInstance.get("/company/companies");
      return response.data as Company[];
    },
  });
  return (
    <main>
      {isLoading ? <p>Loading...</p> : <CompanySelector companies={data!} />}
    </main>
  );
}
