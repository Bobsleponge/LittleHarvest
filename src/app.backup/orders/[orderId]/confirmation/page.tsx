import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderConfirmation } from '@/components/order-confirmation'

interface OrderConfirmationPageProps {
  params: {
    orderId: string
  }
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    notFound()
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.orderId,
      userId: session.user.id,
    },
    include: {
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              ageGroup: {
                select: {
                  name: true
                }
              },
              texture: {
                select: {
                  name: true
                }
              }
            }
          },
          portionSize: {
            select: {
              id: true,
              name: true,
              measurement: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  // Transform the order data to match the expected interface
  const transformedOrder = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    deliveryDate: order.deliveryDate?.toISOString(),
    paymentDueDate: order.paymentDueDate?.toISOString(),
    address: order.address ? {
      street: order.address.street,
      city: order.address.city,
      province: order.address.province,
      postalCode: order.address.postalCode,
      country: order.address.country
    } : undefined,
    items: order.items.map(item => ({
      ...item,
      product: {
        ...item.product,
        imageUrl: item.product.imageUrl || undefined
      }
    })),
    notes: order.notes || undefined
  }

  return <OrderConfirmation order={transformedOrder} />
}
