import { Link } from "react-router-dom"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { blogPosts } from "@/lib/mock-data"

export default function BlogPage() {
  const featured = blogPosts[0]
  const rest = blogPosts.slice(1)

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Travel Journal</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl">
            Stories & Insights
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Inspiration, guides, and stories from the world of luxury travel. Written by our team of experts and seasoned travelers.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Featured Post */}
        <Link
          to={`/blog/${featured.id}`}
          className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground">Featured</Badge>
              </div>
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <Badge variant="outline" className="w-fit text-xs">{featured.category}</Badge>
              <h2 className="mt-4 font-serif text-2xl font-bold text-card-foreground leading-snug md:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <img
                  src={featured.author.avatar}
                  alt={featured.author.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{featured.author.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(featured.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {featured.readTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                  Read Article
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <Badge variant="outline" className="text-xs">{post.category}</Badge>
                <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-card-foreground">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.author.name}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
