
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Image } from "@/components/image";
import { format } from "date-fns";
import { getEvents } from "@/app/actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";

export const revalidate = 0;

const staticEvents = [
  {
    id: 'static-3',
    title: 'Blue Day',
    description: 'Blue Day',
    date: new Date('2025-01-25T00:00:00Z').toISOString(),
    listImage: '/blueday.png',
    registrationOpen: false,
  },
  {
    id: 'static-4',
    title: 'The Flask Edition',
    description: 'The Flask Edition',
    date: new Date('2025-02-06T00:00:00Z').toISOString(),
    listImage: '/flask.png',
    registrationOpen: false,
  },
  {
    id: 'static-2',
    title: 'Web development BootCamp',
    description: 'Web development BootCamp',
    date: new Date('2024-03-14T00:00:00Z').toISOString(),
    listImage: '/web.jpg',
    registrationOpen: false,
  },
  {
    id: 'static-1',
    title: 'Azure Cloud Workshop',
    description: 'Azure Cloud Workshop',
    date: new Date('2023-10-18T00:00:00Z').toISOString(),
    listImage: '/azure.jpg',
    registrationOpen: false,
  },
];

export default async function EventsPage() {
  const result = await getEvents();
  const dynamicEvents = result.events || [];
  const combinedEvents = [...staticEvents, ...dynamicEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <main className="flex-1">
        <section id="events" className="w-full py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="space-y-12">
              <div className="relative w-full py-20 md:py-28 text-center bg-cover bg-center mb-12 rounded-lg" style={{ backgroundImage: "url('/team1.jpg')" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background rounded-lg"></div>
                <div className="relative z-10 container mx-auto px-4">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our <span className="gradient-text">Events</span></h2>
                  <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl mt-4">
                    We host a variety of events to help our members learn, grow, and connect.
                  </p>
                </div>
              </div>
              {combinedEvents.length > 0 ? (
                <StaggerContainer className="grid gap-8 lg:gap-12">
                  {combinedEvents.map((event: any) => (
                    <StaggerItem key={event.id}>
                      <Card className="glass-card-hover overflow-hidden flex flex-col lg:flex-row">
                        <div className="relative h-48 lg:h-auto lg:w-1/3">
                          <Image
                            src={event.listImage || event.bannerImage || '/images/event-placeholder.png'}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-1 lg:w-2/3">
                          <p className="text-sm text-primary font-medium">
                            {event.date && !isNaN(new Date(event.date).getTime())
                              ? format(new Date(event.date), "MMMM d, yyyy")
                              : "Date TBA"}
                          </p>
                          <CardTitle className="pt-2 text-2xl">{event.title}</CardTitle>
                          <p className="text-muted-foreground mt-2 flex-1">{event.description}</p>
                          <div className="mt-6">
                            <Button asChild variant="gradient" className="w-full">
                              <Link href={`/events/${event.id}`}>
                                View Details <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <ScrollReveal>
                  <div className="text-center text-muted-foreground glass-card p-8">
                    <p>No upcoming events at the moment. Check back soon!</p>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
