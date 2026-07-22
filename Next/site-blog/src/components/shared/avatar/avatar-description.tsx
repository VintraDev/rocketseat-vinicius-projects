type AvatarDescriptionProps = {
    children: React.ReactNode;
}

export function AvatarDescription({ children }: AvatarDescriptionProps) {
    return (
        <div className="text-body-xs text-gray-300">
            {children}
        </div>
    )
}