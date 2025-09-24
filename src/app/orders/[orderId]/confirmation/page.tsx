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
              grams: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  return <OrderConfirmation order={order} />
}
