import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import Tag from "./Tag";

interface Props {
  slug: string;
  frontMatter: {
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
  };
}

export default function ArticleCard({ slug, frontMatter }: Props) {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">
          <Link href={`/posts/${slug}`}>{frontMatter.title}</Link>
        </CardTitle>
        {frontMatter.description && (
          <CardDescription>{frontMatter.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        {frontMatter.category && (
          <p className="mb-2">分类：{frontMatter.category}</p>
        )}
        {frontMatter.tags && frontMatter.tags.length > 0 && (
          <div className="flex flex-wrap">
            {frontMatter.tags.map((tag) => (
              <Tag key={tag} tag={tag} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
