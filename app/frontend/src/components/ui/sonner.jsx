import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          success:
            "group toast group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-300 group-[.toaster]:shadow-lg [&>svg]:text-green-600",
          error:
            "group toast group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-300 group-[.toaster]:shadow-lg [&>svg]:text-red-600",
          description: "group-[.toast]:text-muted-foreground group-[.toast.success]:text-green-800 group-[.toast.error]:text-red-800",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
