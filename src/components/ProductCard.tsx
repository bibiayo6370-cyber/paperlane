import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card className="gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.cover_path} alt={product.title} className="aspect-[4/3] w-full object-cover" />
        <CardContent className="space-y-2 p-4">
          <Badge variant="secondary">{product.category}</Badge>
          <h2 className="font-medium leading-snug">{product.title}</h2>
          <p className="text-sm text-muted-foreground">{formatMoney(product.price_minor, product.currency)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
