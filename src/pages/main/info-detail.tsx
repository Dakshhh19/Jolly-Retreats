import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { footerInfoBySlug } from '@/lib/footerInfo'

export default function InfoDetailPage() {
  const { slug = '' } = useParams()

  const item = useMemo(() => footerInfoBySlug(slug), [slug])

  if (!item) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <Card className="p-8">
            <h1 className="font-serif text-3xl font-bold text-foreground">Page Not Found</h1>
            <p className="mt-3 text-muted-foreground">
              The requested footer details page does not exist.
            </p>
            <Link to="/" className="mt-6 inline-block">
              <Button>Back to Home</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-4xl px-6 space-y-6">
        <Card className="p-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-serif text-4xl font-bold text-foreground">{item.title}</h1>
            <Badge variant="outline">{item.section}</Badge>
          </div>
          <p className="mt-4 text-muted-foreground">{item.summary}</p>
        </Card>

        <Card className="p-8">
          <h2 className="font-semibold text-foreground text-xl">Details</h2>
          <div className="mt-4 space-y-3">
            {item.highlights.map((point) => (
              <div key={point} className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
                {point}
              </div>
            ))}
          </div>
        </Card>

        <Link to="/" className="inline-block">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
