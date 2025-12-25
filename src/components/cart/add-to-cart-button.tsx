'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps extends React.ComponentProps<typeof Button> {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image?: string;
  };
}

export function AddToCartButton({ product, className, ...props }: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <Button onClick={() => addItem(product)} className={cn(className)} {...props}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      {props.children || 'Add to Cart'}
    </Button>
  );
}
