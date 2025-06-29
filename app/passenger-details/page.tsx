// app/passenger-details/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, RefreshCcw, AlertTriangle } from "lucide-react";

// Component Imports
import { Button } from "@/app/_components/forms/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/forms/Form";
import { Input } from "@/app/_components/forms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/forms/Select";
import { Card, CardContent } from "@/app/_components/Card";
import ProgressStepper from "@/app/_components/ProgressStepper";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/Alert";

// Context and Schema
import { useFlightContext } from "@/app/context/FlightContext";
import {
  PASSENGER_STORAGE_KEY,
  passengerDetailsSchema,
  type PassengerDetailsForm,
} from "@/src/types/schema";

// Data Imports
import nationalitiesData from "@/src/data/nationalities.json";
import titlesData from "@/src/data/titles.json";

const nationalities = [...nationalitiesData].sort((a, b) =>
  a.label.localeCompare(b.label),
);
const titles = [...titlesData].sort((a, b) => a.label.localeCompare(b.label));

const emptyFormDefaults: PassengerDetailsForm = {
  title: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  nationality: "",
};

// Helper Functions
const saveToStorage = (details: PassengerDetailsForm) => {
  try {
    localStorage.setItem(PASSENGER_STORAGE_KEY, JSON.stringify(details));
  } catch (error) {
    console.error("Error saving passenger details to localStorage:", error);
  }
};

const loadFromStorage = (): PassengerDetailsForm | null => {
  if (typeof window === "undefined") return null;
  try {
    const savedDetails = localStorage.getItem(PASSENGER_STORAGE_KEY);
    return savedDetails ? JSON.parse(savedDetails) : null;
  } catch (error) {
    console.error("Error loading passenger details from localStorage:", error);
    return null;
  }
};

// --- The Component ---
const PassengerDetailsPage = () => {
  const router = useRouter();
  const {
    selectedFlight,
    passengerDetails: contextPassengerDetails,
    setPassengerDetails,
  } = useFlightContext();

  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<PassengerDetailsForm>({
    resolver: zodResolver(passengerDetailsSchema),
    defaultValues:
      contextPassengerDetails || loadFromStorage() || emptyFormDefaults,
  });

  useEffect(() => {
    document.title = "Passenger Details - ExitFlight";
    if (!selectedFlight) {
      console.log("No flight selected in context, redirecting.");
      router.replace("/select-flight");
    }
  }, [selectedFlight, router]);

  const onSubmit = (data: PassengerDetailsForm) => {
    setFormError(null);
    setPassengerDetails(data);
    saveToStorage(data);
    router.push("/ticket-preview");
  };

  const onFormError = (errors: any) => {
    console.log("Form validation failed:", errors);
    setFormError(
      "Please correct the errors highlighted below before continuing.",
    );
  };

  const handleReset = () => {
    form.reset(emptyFormDefaults);
    localStorage.removeItem(PASSENGER_STORAGE_KEY);
    setPassengerDetails(null);
    setFormError(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={2} />
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Passenger Details
          </h2>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onFormError)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {titles.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name/Initial (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter middle name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nationalities.map((n) => (
                            <SelectItem key={n.value} value={n.value}>
                              {n.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {formError && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-8 flex justify-between">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      <ArrowLeft className="mr-2" size={16} /> Back
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="text-muted-foreground border-muted hover:text-destructive"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" /> Reset Form
                    </Button>
                  </div>
                  <Button type="submit">
                    Continue to Preview{" "}
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassengerDetailsPage;
