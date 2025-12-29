interface ExplanationSectionProps {
  title: string
  content: string
  icon?: string
}

/**
 * Individual section of an AI explanation
 */
export default function ExplanationSection({
  title,
  content,
  icon = '•',
}: ExplanationSectionProps) {
  return (
    <div className="space-y-2">
      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{icon}</span>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>

      {/* Content */}
      <p className="text-sm text-text-secondary leading-relaxed pl-6">
        {content}
      </p>
    </div>
  )
}
