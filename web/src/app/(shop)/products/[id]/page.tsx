import dynamic from "next/dynamic";
import LoadingIndicator from "@/components/LoadingIndicator";

const DynamicProductsPage = dynamic(() => import("./products"), {
  ssr: true,
  loading: () => <LoadingIndicator isLoading={true} />,
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <DynamicProductsPage params={resolvedParams} />;
}
