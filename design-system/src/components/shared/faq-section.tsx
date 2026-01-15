import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Container } from "../ui/container";
import { cn } from "../ui/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps extends React.ComponentProps<"section"> {
  title?: string;
  items: FAQItem[];
  onItemToggle?: (id: string, isOpen: boolean) => void;
  className?: string;
}

export function FAQSection({
  title = "Частые вопросы",
  items,
  onItemToggle,
  className,
  ...props
}: FAQSectionProps) {
  return (
    <section className={cn("py-12 md:py-24", className)} {...props}>
      <Container>
        {title && (
          <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        )}
        <div className="max-w-3xl mx-auto">
          <Accordion 
            type="single" 
            collapsible 
            className="w-full"
            onValueChange={(value) => {
              if (onItemToggle && value) {
                onItemToggle(value, true);
              }
            }}
          >
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
