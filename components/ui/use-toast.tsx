import { Toast } from "@/components/ui/toast"

export function useToast() {
  return {
    toast: ({ title, description }: { title: string; description?: string }) => {
      // Basic implementation
      console.log(title, description);
    }
  }
} 