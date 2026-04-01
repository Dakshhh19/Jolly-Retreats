import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { blogPosts } from "@/lib/mock-data"

export default function BlogDetailPage() {
  const { id } = useParams()
  const post = blogPosts.find((p) => p.id === id)
  const related = blogPosts.filter((p) => p.id !== id).slice(0, 2)

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="font-serif text-2xl text-foreground">Article not found</p>
        <Link to="/blog">
          <button className="mt-4 text-sm text-primary hover:underline">Back to Blog</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="mt-8">
          <Badge variant="outline" className="text-xs">{post.category}</Badge>
          <h1 className="mt-4 font-serif text-3xl font-bold text-foreground leading-tight md:text-4xl lg:text-5xl text-balance">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center gap-4">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-foreground">{post.author.name}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="mt-10 prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            {post.content}
          </p>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            The journey of discovering new places goes beyond mere sightseeing. It is about immersing yourself in a culture,
            tasting flavors you have never experienced, and forming connections with people whose lives are vastly different from your own.
            Every destination holds a story, and it is up to the thoughtful traveler to uncover it.
          </p>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            At Jolly Retreats, we believe that the most meaningful travel experiences are those that leave a lasting impression
            not just on our guests, but on the communities they visit. Our commitment to sustainable tourism, local partnerships,
            and authentic cultural exchanges ensures that every retreat contributes positively to the world.
          </p>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Whether you are seeking the tranquility of a remote mountain cottage or the excitement of exploring ancient ruins
            with an expert guide, the key is to approach each experience with curiosity and openness. The world is vast,
            beautiful, and waiting to be explored.
          </p>
        </div>

        {/* Tags */}
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Related Articles */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Related Articles</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-primary">{p.category}</p>
                  <h3 className="mt-1 font-serif text-lg font-semibold text-card-foreground leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
