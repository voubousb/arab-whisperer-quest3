import { cn } from "@/lib/utils";
import { getAvatarById } from "@/data/avatars";

interface AvatarDisplayProps {
  avatarId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-16 h-16 text-3xl",
  xl: "w-20 h-20 text-4xl",
};

export const AvatarDisplay = ({ avatarId, size = "md", className }: AvatarDisplayProps) => {
  const avatar = getAvatarById(avatarId);
  
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: avatar.color + "30", borderColor: avatar.color }}
    >
      <span className="drop-shadow-sm">{avatar.emoji}</span>
    </div>
  );
};
