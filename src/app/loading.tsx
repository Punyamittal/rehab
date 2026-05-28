import { PencilLoader } from "@/components/ui/PencilLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <PencilLoader />
    </div>
  );
}
