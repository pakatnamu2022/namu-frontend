import { DriverAvatarProps } from "../lib/monitoreo.interface";

export function DriverAvatar({ name }: DriverAvatarProps) {
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary
        text-sm font-semibold">
            {initials}
        </div>

    );
}

