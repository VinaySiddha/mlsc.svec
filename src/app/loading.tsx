import { BrutalistLoader } from "@/components/ui/brutalist-loader";

export default function RootLoading() {
  return <BrutalistLoader fullScreen={true} statusText="SYNCHRONIZING MLSC PROTOCOL" />;
}

