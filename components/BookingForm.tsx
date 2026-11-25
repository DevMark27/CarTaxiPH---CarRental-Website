"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { BookingRecord, UploadedDoc } from "@/lib/bookings";
import { site } from "@/lib/site";
import {
  categories,
  isVehicleAvailable,
  vehicleName,
  vehicles,
  type Category,
  type RentalArrangement,
} from "@/lib/vehicles";
import {
  ArrowRightIcon,
  CheckIcon,
  GearIcon,
  UsersIcon,
} from "./Icons";

const inputCls =
  "mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const textareaCls =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10";
const labelCls = "block text-sm font-medium text-ink";
const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { id: 0, title: "Trip Details" },
  { id: 1, title: "Personal Information" },
  { id: 2, title: "Identification" },
  { id: 3, title: "Review Booking" },
  { id: 4, title: "Submit Reservation" },
] as const;

type DocSlot = "front" | "back" | "supporting";

type DocUploadState = {
  doc: UploadedDoc | null;
  previewUrl: string | null;
  uploading: boolean;
  progress: number;
  error: string;
};

const emptyDocState = (): DocUploadState => ({
  doc: null,
  previewUrl: null,
  uploading: false,
  progress: 0,
  error: "",
});

type FieldErrors = Record<string, string>;

const ID_TYPES = [
  "Driver's License",
  "Philippine National ID (PhilSys)",
  "Passport",
  "UMID / SSS ID",
  "PRC ID",
];

function todayLocalISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function UploadGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function BookingForm({ defaultVehicleSlug }: { defaultVehicleSlug?: string }) {
  const params = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const minDate = useMemo(() => todayLocalISO(), []);
  const wizardTopRef = useRef<HTMLFormElement>(null);

  function scrollToWizardTop() {
    wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const paramVehicle = params.get("vehicle");
  const paramCategory = params.get("category");
  const initialResolved =
    (paramVehicle ? vehicles.find((v) => v.slug === paramVehicle) : undefined) ??
    (paramCategory ? vehicles.find((v) => v.category === paramCategory) : undefined) ??
    (defaultVehicleSlug ? vehicles.find((v) => v.slug === defaultVehicleSlug) : undefined);

  const [selectedSlug, setSelectedSlug] = useState(initialResolved?.slug ?? "");
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<"" | Category>("");
  const resolvedVehicle = selectedSlug ? vehicles.find((v) => v.slug === selectedSlug) : undefined;

  const paramArrangement = params.get("arrangement");
  const initialArrangement: RentalArrangement =
    paramArrangement === "One-way" || paramArrangement === "Round trip"
      ? paramArrangement
      : (resolvedVehicle?.arrangements[0] ?? "Round trip");

  // Step 1: Trip Details
  const [arrangement, setArrangement] = useState<RentalArrangement>(initialArrangement);
  const [pickup, setPickup] = useState(params.get("pickup") ?? site.pickupLocations[0]);
  const [dropoff, setDropoff] = useState(params.get("dropoff") ?? params.get("pickup") ?? site.pickupLocations[0]);
  const [start, setStart] = useState(params.get("start") ?? "");
  const [startTime, setStartTime] = useState(params.get("startTime") ?? "09:00");
  const durationDays = 1;
  const [passengers, setPassengers] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [tripNotes, setTripNotes] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Step 2: Personal Information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");

  // Step 3: Identification
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [idNumber, setIdNumber] = useState("");
  const [frontState, setFrontState] = useState<DocUploadState>(emptyDocState);
  const [backState, setBackState] = useState<DocUploadState>(emptyDocState);
  const [supportingState, setSupportingState] = useState<DocUploadState>(emptyDocState);
  const [draggingSlot, setDraggingSlot] = useState<DocSlot | null>(null);

  // Step 5: Submit Reservation
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<FieldErrors>({});

  if (!resolvedVehicle) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-white p-8 text-center shadow-xs sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">No Vehicle Selected</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          Please choose a vehicle first
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Visit our Vehicles section to pick the unit that fits your trip, then select{" "}
          <strong className="text-ink">Book</strong> or <strong className="text-ink">View Details</strong> to begin.
        </p>
        <Link
          href="/#fleet"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Browse Vehicles
          <ArrowRightIcon width={15} height={15} />
        </Link>
      </div>
    );
  }

  const vehicle = resolvedVehicle;
  const activeArrangement = vehicle.arrangements.includes(arrangement) ? arrangement : vehicle.arrangements[0];
  const vehicleAvailable = isVehicleAvailable(vehicle);

  function clearError(key: string) {
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  async function validateStep(step: number): Promise<boolean> {
    const nextErrors: FieldErrors = {};

    if (step === 0) {
      if (!vehicleAvailable) {
        nextErrors.availability = "This vehicle is currently unavailable. Please choose another vehicle.";
      }
      if (!pickup.trim()) nextErrors.pickup = "Please enter your pick-up location.";
      if (!dropoff.trim()) nextErrors.dropoff = "Please enter your drop-off location.";
      if (!start) {
        nextErrors.start = "Please select a pick-up date.";
      } else if (start < minDate) {
        nextErrors.start = "Pick-up date cannot be in the past.";
      }
      if (!startTime) nextErrors.startTime = "Please select a pick-up time.";
      if (!Number.isFinite(passengers) || passengers < 1 || passengers > vehicle.passengers) {
        nextErrors.passengers = `This vehicle seats between 1 and ${vehicle.passengers} passengers.`;
      }

      if (Object.keys(nextErrors).length === 0) {
        setCheckingAvailability(true);
        try {
          const q = new URLSearchParams({
            checkAvailability: "1",
            vehicleSlug: vehicle.slug,
            pickupDate: start,
            pickupTime: startTime,
            durationDays: String(durationDays),
          });
          const res = await fetch(`/api/bookings?${q.toString()}`, { cache: "no-store" });
          if (!res.ok) {
            throw new Error(`Availability check failed (${res.status})`);
          }
          const data = await res.json();
          if (!data.available) {
            nextErrors.availability =
              data.reason || "Sorry, this vehicle is not available for that schedule.";
          }
        } catch {
          nextErrors.availability = "Unable to verify availability right now. Please try again.";
        } finally {
          setCheckingAvailability(false);
        }
      }
    }

    if (step === 1) {
      if (!fullName.trim()) nextErrors.fullName = "Please enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        nextErrors.email = "Please enter a valid email address (e.g. juan@example.com).";
      }
      if (mobile.replace(/\D/g, "").length < 10) {
        nextErrors.mobile = "Please enter a valid mobile number (e.g. 0917 123 4567).";
      }
      if (!address.trim()) nextErrors.address = "Please enter your residential address.";
    }

    if (step === 2) {
      if (!idType) nextErrors.idType = "Please select an identification type.";
      if (!idNumber.trim()) nextErrors.idNumber = "Please enter your ID number.";
      if (!frontState.doc) nextErrors.frontDoc = "Please upload the front side of your ID to continue.";
    }

    if (step === 4) {
      if (!agreedTerms) nextErrors.agreedTerms = "Please accept the rental terms and conditions to submit.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleNextStep() {
    const valid = await validateStep(activeStep);
    if (!valid) return;
    setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));
    setErrors({});
    setDirection(1);
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    scrollToWizardTop();
  }

  function handlePrevStep() {
    setErrors({});
    setDirection(-1);
    setActiveStep((prev) => Math.max(prev - 1, 0));
    scrollToWizardTop();
  }

  async function handleStepClick(targetStep: number) {
    if (targetStep === activeStep) return;
    const canJumpTo = completedSteps[targetStep] || targetStep < activeStep;
    if (!canJumpTo) return;

    if (targetStep > activeStep) {
      const valid = await validateStep(activeStep);
      if (!valid) return;
      setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));
    }
    setErrors({});
    setDirection(targetStep > activeStep ? 1 : -1);
    setActiveStep(targetStep);
    scrollToWizardTop();
  }

  function getDocSetter(slot: DocSlot) {
    if (slot === "front") return setFrontState;
    if (slot === "back") return setBackState;
    return setSupportingState;
  }

  function uploadFile(slot: DocSlot, file: File) {
    const setSlot = getDocSetter(slot);
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setSlot((prev) => ({
        ...prev,
        error: "Unsupported format. Please upload JPG, JPEG, PNG, or PDF.",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSlot((prev) => ({ ...prev, error: "File exceeds the 5 MB limit." }));
      return;
    }

    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setSlot({ doc: null, previewUrl, uploading: true, progress: 15, error: "" });
    if (slot === "front") clearError("frontDoc");

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.min(95, Math.round((ev.loaded / ev.total) * 100));
        setSlot((prev) => ({ ...prev, progress: pct }));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setSlot({
            doc: data as UploadedDoc,
            previewUrl,
            uploading: false,
            progress: 100,
            error: "",
          });
        } else {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setSlot({
            doc: null,
            previewUrl: null,
            uploading: false,
            progress: 0,
            error: data.error || "Upload failed.",
          });
        }
      } catch {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSlot({
          doc: null,
          previewUrl: null,
          uploading: false,
          progress: 0,
          error: "Upload failed.",
        });
      }
    };

    xhr.onerror = () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSlot({
        doc: null,
        previewUrl: null,
        uploading: false,
        progress: 0,
        error: "Network error during upload.",
      });
    };

    xhr.send(formData);
  }

  function handleFileInput(slot: DocSlot, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadFile(slot, file);
  }

  function handleDrop(slot: DocSlot, e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDraggingSlot(null);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(slot, file);
  }

  function removeDoc(slot: DocSlot) {
    const setSlot = getDocSetter(slot);
    setSlot((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return emptyDocState();
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (activeStep < STEPS.length - 1) {
      await handleNextStep();
      return;
    }

    if (submitting) return;
    setSubmitError("");

    const validFinal = await validateStep(4);
    if (!validFinal) return;

    for (const p of [0, 1, 2]) {
      const ok = await validateStep(p);
      if (!ok) {
        setActiveStep(p);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleSlug: vehicle.slug,
          arrangement: activeArrangement,
          pickupLocation: pickup.trim(),
          dropoffLocation: dropoff.trim(),
          pickupDate: start,
          pickupTime: startTime,
          durationDays,
          passengers,
          tripNotes: tripNotes.trim() || undefined,
          customer: {
            fullName: fullName.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            address: address.trim(),
            emergencyContactName: emergencyContactName.trim() || undefined,
            emergencyContactNumber: emergencyContactNumber.trim() || undefined,
          },
          identification: {
            idType,
            idNumber: idNumber.trim(),
            frontDoc: frontState.doc,
            backDoc: backState.doc || undefined,
            supportingDoc: supportingState.doc || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Unable to submit reservation. Please review your details.");
        return;
      }

      setCompletedSteps({ 0: true, 1: true, 2: true, 3: true, 4: true });
      setConfirmedBooking(data.booking as BookingRecord);
      scrollToWizardTop();
    } catch {
      setSubmitError("Network error while submitting your reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Confirmation Screen
  if (confirmedBooking) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-8 shadow-[0_12px_36px_-18px_rgba(0,0,0,0.12)] sm:p-10"
      >
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white">
            <CheckIcon width={28} height={28} strokeWidth={2.5} />
          </span>
          <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
            {confirmedBooking.status}
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Reservation Submitted
          </h2>
          <p className="mt-2 text-sm text-muted">
            Booking Reference:{" "}
            <span className="font-mono font-bold text-ink">{confirmedBooking.referenceNumber}</span>
          </p>
        </div>

        <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Selected Vehicle</dt>
            <dd className="font-semibold text-ink">{confirmedBooking.vehicleName}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Trip Schedule</dt>
            <dd className="text-right font-medium text-ink">
              {confirmedBooking.pickupLocation} → {confirmedBooking.dropoffLocation}
              <span className="block text-xs text-muted">
                {confirmedBooking.pickupDate} · {confirmedBooking.pickupTime} ({confirmedBooking.durationDays}{" "}
                {confirmedBooking.durationDays === 1 ? "day" : "days"})
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Service Type</dt>
            <dd className="font-medium text-ink">With Driver Only ({confirmedBooking.arrangement})</dd>
          </div>
          <div className="flex justify-between gap-4 py-3.5">
            <dt className="text-muted">Quotation</dt>
            <dd className="font-semibold text-brand">Distance-based quote via WhatsApp</dd>
          </div>
        </dl>

        <div className="mt-6 space-y-2 text-sm text-muted">
          <p>
            <strong className="text-ink">What happens next:</strong> Our administrator will review your trip details,
            verify your uploaded ID, and assign your professional driver.
          </p>
          <p>
            No payment is required now. Your distance-based quote and payment instructions will be sent via{" "}
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand underline underline-offset-2"
            >
              WhatsApp
            </a>{" "}
            or <strong className="text-ink">{confirmedBooking.customer.email}</strong> after confirmation.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Print / Download Confirmation
          </button>
          <Link
            href="/#fleet"
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Back to Vehicles
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form ref={wizardTopRef} onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Connected-Circle Progress Stepper */}
      <nav aria-label="Reservation progress" className="rounded-xl border border-line bg-white px-5 py-4 sm:px-7">
        <div className="mb-3 flex items-center justify-between md:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">
            Step {activeStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm font-semibold text-ink">{STEPS[activeStep].title}</span>
        </div>

        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = activeStep === step.id;
            const isCompleted = Boolean(completedSteps[step.id]);
            const isClickable = isCompleted || step.id < activeStep;
            const showCheck = isCompleted && !isActive;

            return (
              <li
                key={step.id}
                className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : "shrink-0"}`}
              >
                <motion.button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isClickable && !isActive}
                  whileHover={isClickable && !prefersReducedMotion ? { scale: 1.03 } : undefined}
                  whileTap={isClickable && !prefersReducedMotion ? { scale: 0.97 } : undefined}
                  aria-current={isActive ? "step" : undefined}
                  aria-disabled={!isClickable && !isActive}
                  className={`group flex items-center gap-2.5 text-left ${
                    isClickable ? "cursor-pointer" : isActive ? "cursor-default" : "cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors duration-200 ${
                      showCheck
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : isActive
                          ? "border-brand bg-brand text-white shadow-[0_0_0_4px_rgba(227,24,36,0.12)]"
                          : "border-line bg-white text-muted"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showCheck ? (
                        <motion.span
                          key="check"
                          initial={prefersReducedMotion ? false : { scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.18, ease }}
                          className="grid place-items-center"
                        >
                          <CheckIcon width={15} height={15} strokeWidth={2.5} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="num"
                          initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.15, ease }}
                        >
                          {step.id + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>

                  <span
                    className={`hidden text-xs font-semibold md:block ${
                      isActive ? "text-ink" : isCompleted ? "text-ink group-hover:text-brand" : "text-muted"
                    }`}
                  >
                    {step.title}
                  </span>
                </motion.button>

                {index < STEPS.length - 1 && (
                  <div className="mx-2.5 h-0.5 flex-1 overflow-hidden rounded-full bg-line sm:mx-3" aria-hidden="true">
                    <motion.div
                      initial={false}
                      animate={{ scaleX: isCompleted ? 1 : 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease }}
                      style={{ originX: 0 }}
                      className="h-full w-full bg-emerald-600"
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Collapsible Booking Summary */}
      <details className="rounded-xl border border-line bg-white lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          <span>Booking Summary · {vehicleName(vehicle)}</span>
          <span className="text-xs font-medium text-brand">Details</span>
        </summary>
        <div className="space-y-2 border-t border-line px-4 py-3 text-xs text-muted">
          <p className="font-medium text-ink">
            {vehicle.year} {vehicleName(vehicle)} · {vehicle.passengers} seats · {vehicle.transmission}
          </p>
          <p>Route: <strong className="text-ink">{pickup || "—"} → {dropoff || "—"}</strong></p>
          <p>
            Schedule: <strong className="text-ink">{start ? `${start} ${startTime}` : "Not set"}</strong> ({durationDays}{" "}
            {durationDays === 1 ? "day" : "days"})
          </p>
          <p>Quote: <strong className="text-brand">Distance-based via WhatsApp</strong></p>
        </div>
      </details>

      {/* Main Form + Desktop Secondary Summary */}
      <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
        <div className="rounded-xl border border-line bg-white p-6 shadow-[0_12px_36px_-18px_rgba(0,0,0,0.08)] sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1: TRIP DETAILS */}
            {activeStep === 0 && (
              <motion.section
                key="stage-0"
                initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: direction * -16 }}
                transition={{ duration: 0.22, ease }}
              >
                {/* Compact Selected Vehicle Strip */}
                <div className="mb-7 border-b border-line pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-mist">
                        <Image
                          src={vehicle.images[0].src}
                          alt={vehicle.images[0].alt}
                          fill
                          loading="eager"
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted">
                          {vehicle.category} · {vehicle.year}
                        </p>
                        <p className="text-base font-semibold text-ink">{vehicleName(vehicle)}</p>
                        <p className="text-xs text-muted">
                          {vehicle.passengers} seats · {vehicle.transmission}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVehiclePickerOpen((open) => !open)}
                      aria-expanded={vehiclePickerOpen}
                      className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/5"
                    >
                      {vehiclePickerOpen ? "Close" : "Change Vehicle"}
                    </button>
                  </div>

                  {/* Inline Available Vehicle Selector */}
                  <AnimatePresence initial={false}>
                    {vehiclePickerOpen && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 rounded-xl border border-line bg-mist/35 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                              Available Vehicles
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {(["", ...categories] as const).map((cat) => {
                                const active = pickerCategory === cat;
                                const label = cat === "" ? "All" : cat === "Passenger Van" ? "Van" : cat;
                                return (
                                  <button
                                    key={label}
                                    type="button"
                                    onClick={() => setPickerCategory(cat)}
                                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                      active
                                        ? "bg-brand text-white"
                                        : "border border-line bg-white text-ink hover:border-ink/40"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                            {vehicles
                              .filter(
                                (v) =>
                                  isVehicleAvailable(v) &&
                                  (!pickerCategory || v.category === pickerCategory),
                              )
                              .map((v) => {
                                const isCurrent = v.slug === vehicle.slug;
                                return (
                                  <button
                                    key={v.slug}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSlug(v.slug);
                                      setPassengers((p) => Math.min(p, v.passengers));
                                      clearError("availability");
                                      setVehiclePickerOpen(false);
                                    }}
                                    className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition ${
                                      isCurrent
                                        ? "border-brand bg-white ring-1 ring-brand/25"
                                        : "border-line bg-white hover:border-ink/40"
                                    }`}
                                  >
                                    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded bg-mist">
                                      <Image src={v.images[0].src} alt="" fill sizes="64px" className="object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-semibold text-ink">
                                        {v.year} {vehicleName(v)}
                                      </p>
                                      <p className="text-[11px] text-muted">
                                        {v.category} · {v.passengers} seats · {v.transmission}
                                      </p>
                                    </div>
                                    {isCurrent && (
                                      <CheckIcon width={15} height={15} className="shrink-0 text-brand" />
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <h2 className="text-xl font-semibold text-ink">Tell us about your trip</h2>
                <p className="mt-1 text-sm text-muted">Where and when would you like to travel?</p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className={labelCls}>
                    <span className="flex items-center justify-between">
                      <span>Pick-up location *</span>
                      {pickup.trim() && !errors.pickup && (
                        <CheckIcon width={14} height={14} className="text-emerald-600" />
                      )}
                    </span>
                    <input
                      required
                      name="pickup"
                      list="book-locations"
                      value={pickup}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        clearError("pickup");
                        clearError("availability");
                      }}
                      placeholder="e.g. NAIA Terminal 3"
                      className={`${inputCls} ${errors.pickup ? "border-brand" : ""}`}
                    />
                    {errors.pickup && <span className="mt-1 block text-xs text-brand">{errors.pickup}</span>}
                  </label>

                  <label className={labelCls}>
                    <span className="flex items-center justify-between gap-2">
                      <span>Drop-off location *</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDropoff(pickup);
                          clearError("dropoff");
                        }}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Same as pick-up
                      </button>
                    </span>
                    <input
                      required
                      name="dropoff"
                      list="book-locations"
                      value={dropoff}
                      onChange={(e) => {
                        setDropoff(e.target.value);
                        clearError("dropoff");
                      }}
                      placeholder="e.g. Tagaytay City"
                      className={`${inputCls} ${errors.dropoff ? "border-brand" : ""}`}
                    />
                    {errors.dropoff && <span className="mt-1 block text-xs text-brand">{errors.dropoff}</span>}
                  </label>

                  <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 -mt-2">
                    <span className="mr-1 text-[11px] font-medium text-muted">Popular:</span>
                    {["NAIA Terminal 3", "Makati / BGC", "Quezon City"].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setPickup(loc);
                          clearError("pickup");
                          clearError("availability");
                        }}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                          pickup === loc
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-line bg-white text-muted hover:border-ink/40 hover:text-ink"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>

                  <label className={labelCls}>
                    Pick-up date *
                    <input
                      required
                      type="date"
                      name="start"
                      min={minDate}
                      value={start}
                      onChange={(e) => {
                        setStart(e.target.value);
                        clearError("start");
                        clearError("availability");
                      }}
                      className={`${inputCls} ${errors.start ? "border-brand" : ""}`}
                    />
                    {errors.start && <span className="mt-1 block text-xs text-brand">{errors.start}</span>}
                  </label>

                  <label className={labelCls}>
                    Pick-up time *
                    <input
                      required
                      type="time"
                      name="startTime"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        clearError("startTime");
                        clearError("availability");
                      }}
                      className={`${inputCls} ${errors.startTime ? "border-brand" : ""}`}
                    />
                    {errors.startTime && <span className="mt-1 block text-xs text-brand">{errors.startTime}</span>}
                  </label>

                  <div className={labelCls}>
                    <span>Number of passengers *</span>
                    <div className="mt-1.5 flex h-11 items-center justify-between rounded-lg border border-line bg-white px-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPassengers((p) => Math.max(1, p - 1));
                          clearError("passengers");
                        }}
                        aria-label="Decrease passengers"
                        className="grid h-7 w-7 place-items-center rounded bg-mist text-sm font-bold text-ink hover:bg-line"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-ink">
                        {passengers} {passengers === 1 ? "passenger" : "passengers"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPassengers((p) => Math.min(vehicle.passengers, p + 1));
                          clearError("passengers");
                        }}
                        aria-label="Increase passengers"
                        className="grid h-7 w-7 place-items-center rounded bg-mist text-sm font-bold text-ink hover:bg-line"
                      >
                        +
                      </button>
                    </div>
                    {errors.passengers && <span className="mt-1 block text-xs text-brand">{errors.passengers}</span>}
                  </div>

                  <div className="sm:col-span-2">
                    <span className={labelCls}>Trip arrangement</span>
                    <div className="mt-1.5 grid grid-cols-2 gap-3">
                      {(["One-way", "Round trip"] as RentalArrangement[]).map((a) => {
                        const offered = vehicle.arrangements.includes(a);
                        return (
                          <label
                            key={a}
                            className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 text-sm transition ${
                              activeArrangement === a ? "border-ink bg-mist/60" : "border-line"
                            } ${offered ? "" : "cursor-not-allowed opacity-40"}`}
                          >
                            <input
                              type="radio"
                              name="arrangement"
                              value={a}
                              disabled={!offered}
                              checked={activeArrangement === a}
                              onChange={() => setArrangement(a)}
                              className="accent-[#E31824]"
                            />
                            <span className="font-medium text-ink">{a}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progressive Disclosure for Optional Notes */}
                  <div className="sm:col-span-2">
                    {!showNotes ? (
                      <button
                        type="button"
                        onClick={() => setShowNotes(true)}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        + Add trip purpose or special notes (optional)
                      </button>
                    ) : (
                      <motion.label
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={labelCls}
                      >
                        Trip purpose or additional notes (optional)
                        <textarea
                          name="tripNotes"
                          rows={3}
                          value={tripNotes}
                          onChange={(e) => setTripNotes(e.target.value)}
                          placeholder="e.g. Airport arrival flight PR 103, family trip, luggage notes..."
                          className={textareaCls}
                        />
                      </motion.label>
                    )}
                  </div>
                </div>

                {errors.availability && (
                  <p role="alert" className="mt-4 rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 text-xs font-medium text-brand">
                    {errors.availability}
                  </p>
                )}

                <datalist id="book-locations">
                  {site.pickupLocations.map((l) => (
                    <option key={l} value={l} />
                  ))}
                  <option value="Tagaytay City" />
                  <option value="BGC, Taguig" />
                  <option value="Alabang, Muntinlupa" />
                </datalist>
              </motion.section>
            )}

            {/* STEP 2: PERSONAL INFORMATION */}
            {activeStep === 1 && (
              <motion.section
                key="stage-1"
                initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: direction * -16 }}
                transition={{ duration: 0.22, ease }}
              >
                <h2 className="text-xl font-semibold text-ink">Tell us a little about yourself</h2>
                <p className="mt-1 text-sm text-muted">
                  We need your contact information to coordinate your reservation.
                </p>

                <p className="mt-4 rounded-lg bg-mist/60 px-4 py-2.5 text-xs text-muted">
                  Our rental service is <strong className="text-ink">with driver only</strong>. Driver assignment is
                  handled by our team after confirmation.
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className={`${labelCls} sm:col-span-2`}>
                    Full name *
                    <input
                      required
                      name="fullName"
                      autoComplete="name"
                      placeholder="e.g. Juan Dela Cruz"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearError("fullName");
                      }}
                      className={`${inputCls} ${errors.fullName ? "border-brand" : ""}`}
                    />
                    {errors.fullName && <span className="mt-1 block text-xs text-brand">{errors.fullName}</span>}
                  </label>

                  <label className={labelCls}>
                    Email address *
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="e.g. juan@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      className={`${inputCls} ${errors.email ? "border-brand" : ""}`}
                    />
                    {errors.email && <span className="mt-1 block text-xs text-brand">{errors.email}</span>}
                  </label>

                  <label className={labelCls}>
                    Mobile number *
                    <input
                      required
                      type="tel"
                      name="mobile"
                      autoComplete="tel"
                      placeholder="e.g. 0917 123 4567"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        clearError("mobile");
                      }}
                      className={`${inputCls} ${errors.mobile ? "border-brand" : ""}`}
                    />
                    {errors.mobile && <span className="mt-1 block text-xs text-brand">{errors.mobile}</span>}
                  </label>

                  <label className={`${labelCls} sm:col-span-2`}>
                    Residential address *
                    <input
                      required
                      name="address"
                      autoComplete="street-address"
                      placeholder="e.g. 123 Ayala Ave, Makati City"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        clearError("address");
                      }}
                      className={`${inputCls} ${errors.address ? "border-brand" : ""}`}
                    />
                    {errors.address && <span className="mt-1 block text-xs text-brand">{errors.address}</span>}
                  </label>

                  {/* Progressive Disclosure for Emergency Contact */}
                  <div className="sm:col-span-2">
                    {!showEmergency ? (
                      <button
                        type="button"
                        onClick={() => setShowEmergency(true)}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        + Add emergency contact (optional)
                      </button>
                    ) : (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <label className={labelCls}>
                          Emergency contact name (optional)
                          <input
                            name="emergencyContactName"
                            placeholder="e.g. Maria Dela Cruz"
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            className={inputCls}
                          />
                        </label>

                        <label className={labelCls}>
                          Emergency contact number (optional)
                          <input
                            type="tel"
                            name="emergencyContactNumber"
                            placeholder="e.g. 0918 765 4321"
                            value={emergencyContactNumber}
                            onChange={(e) => setEmergencyContactNumber(e.target.value)}
                            className={inputCls}
                          />
                        </label>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {/* STEP 3: IDENTIFICATION */}
            {activeStep === 2 && (
              <motion.section
                key="stage-2"
                initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: direction * -16 }}
                transition={{ duration: 0.22, ease }}
              >
                <h2 className="text-xl font-semibold text-ink">Verify your identity</h2>
                <p className="mt-1 text-sm text-muted">
                  Upload the required identification documents to help us process your booking.
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className={labelCls}>
                    Identification type *
                    <select
                      value={idType}
                      onChange={(e) => {
                        setIdType(e.target.value);
                        clearError("idType");
                      }}
                      className={inputCls}
                    >
                      {ID_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={labelCls}>
                    ID number *
                    <input
                      required
                      value={idNumber}
                      onChange={(e) => {
                        setIdNumber(e.target.value);
                        clearError("idNumber");
                      }}
                      placeholder="e.g. N01-23-456789"
                      className={`${inputCls} ${errors.idNumber ? "border-brand" : ""}`}
                    />
                    {errors.idNumber && <span className="mt-1 block text-xs text-brand">{errors.idNumber}</span>}
                  </label>
                </div>

                <div className="mt-6 space-y-5 divide-y divide-line">
                  {(
                    [
                      { slot: "front" as const, title: "Front Side of ID", required: true, state: frontState },
                      { slot: "back" as const, title: "Back Side of ID", required: false, state: backState },
                      {
                        slot: "supporting" as const,
                        title: "Additional Supporting Document",
                        required: false,
                        state: supportingState,
                      },
                    ]
                  ).map(({ slot, title, required, state }) => (
                    <div key={slot} className="pt-5 first:pt-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink">
                          {title}{" "}
                          <span className={`ml-1 text-xs font-semibold ${required ? "text-brand" : "text-muted"}`}>
                            ({required ? "Required" : "Optional"})
                          </span>
                        </span>
                        {state.doc && (
                          <button
                            type="button"
                            onClick={() => removeDoc(slot)}
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {state.uploading && (
                        <div className="mt-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                            <div className="h-full bg-brand transition-all duration-200" style={{ width: `${state.progress}%` }} />
                          </div>
                          <p className="mt-1 text-xs text-muted">Uploading securely... {state.progress}%</p>
                        </div>
                      )}

                      {state.doc ? (
                        <motion.div
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-mist/30 p-3"
                        >
                          {state.previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={state.previewUrl} alt={`${title} preview`} className="h-11 w-14 rounded object-cover" />
                          ) : (
                            <span className="grid h-11 w-14 place-items-center rounded bg-white text-xs font-bold text-ink">
                              PDF
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-ink">{state.doc.originalName}</p>
                            <p className="flex items-center gap-1 text-[11px] text-emerald-700">
                              <CheckIcon width={12} height={12} /> Uploaded · {(state.doc.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <label className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-ink">
                            Replace
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleFileInput(slot, e)}
                              className="hidden"
                            />
                          </label>
                        </motion.div>
                      ) : (
                        !state.uploading && (
                          <label
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDraggingSlot(slot);
                            }}
                            onDragLeave={() => setDraggingSlot(null)}
                            onDrop={(e) => handleDrop(slot, e)}
                            className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-5 text-center text-xs transition ${
                              draggingSlot === slot
                                ? "border-brand bg-brand/5 text-ink"
                                : "border-charcoal/25 bg-mist/20 text-muted hover:border-brand hover:bg-white hover:text-ink"
                            }`}
                          >
                            <UploadGlyph />
                            <span className="font-medium">Drag and drop or click to upload</span>
                            <span className="text-[11px] text-muted">JPG, JPEG, PNG, or PDF (max 5 MB)</span>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleFileInput(slot, e)}
                              className="hidden"
                            />
                          </label>
                        )
                      )}

                      {state.error && <p className="mt-2 text-xs font-medium text-brand">{state.error}</p>}
                    </div>
                  ))}
                  {errors.frontDoc && <p className="text-xs font-medium text-brand">{errors.frontDoc}</p>}
                </div>
              </motion.section>
            )}

            {/* STEP 4: REVIEW BOOKING */}
            {activeStep === 3 && (
              <motion.section
                key="stage-3"
                initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: direction * -16 }}
                transition={{ duration: 0.22, ease }}
              >
                <h2 className="text-xl font-semibold text-ink">Review your reservation</h2>
                <p className="mt-1 text-sm text-muted">
                  Double-check your details below before proceeding to submission.
                </p>

                <div className="mt-6 divide-y divide-line border-y border-line text-sm">
                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Selected Vehicle</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setDirection(-1);
                          setActiveStep(0);
                          setVehiclePickerOpen(true);
                          scrollToWizardTop();
                        }}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="mt-2 font-semibold text-ink">
                      {vehicle.year} {vehicleName(vehicle)} ({vehicle.category} · {vehicle.passengers} seats ·{" "}
                      {vehicle.transmission})
                    </p>
                  </div>

                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Trip Details</h3>
                      <button type="button" onClick={() => setActiveStep(0)} className="text-xs font-semibold text-brand hover:underline">
                        Edit
                      </button>
                    </div>
                    <dl className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      <div><dt className="text-xs text-muted">Pick-up</dt><dd className="font-medium text-ink">{pickup}</dd></div>
                      <div><dt className="text-xs text-muted">Drop-off</dt><dd className="font-medium text-ink">{dropoff}</dd></div>
                      <div><dt className="text-xs text-muted">Schedule</dt><dd className="font-medium text-ink">{start} · {startTime}</dd></div>
                      <div><dt className="text-xs text-muted">Passengers</dt><dd className="font-medium text-ink">{passengers} {passengers === 1 ? "passenger" : "passengers"}</dd></div>
                    </dl>
                  </div>

                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Customer Information</h3>
                      <button type="button" onClick={() => setActiveStep(1)} className="text-xs font-semibold text-brand hover:underline">
                        Edit
                      </button>
                    </div>
                    <dl className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      <div><dt className="text-xs text-muted">Full Name</dt><dd className="font-medium text-ink">{fullName}</dd></div>
                      <div><dt className="text-xs text-muted">Email</dt><dd className="font-medium text-ink">{email}</dd></div>
                      <div><dt className="text-xs text-muted">Mobile</dt><dd className="font-medium text-ink">{mobile}</dd></div>
                      <div><dt className="text-xs text-muted">Address</dt><dd className="font-medium text-ink">{address}</dd></div>
                    </dl>
                  </div>

                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Identification Documents</h3>
                      <button type="button" onClick={() => setActiveStep(2)} className="text-xs font-semibold text-brand hover:underline">
                        Edit
                      </button>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-xs">
                      <li className="flex justify-between gap-2">
                        <span className="text-muted">{idType}</span>
                        <span className="font-medium text-ink">{idNumber}</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-muted">Front ID</span>
                        <span className="font-medium text-emerald-700">{frontState.doc?.originalName}</span>
                      </li>
                      {backState.doc && (
                        <li className="flex justify-between gap-2">
                          <span className="text-muted">Back ID</span>
                          <span className="font-medium text-emerald-700">{backState.doc.originalName}</span>
                        </li>
                      )}
                      {supportingState.doc && (
                        <li className="flex justify-between gap-2">
                          <span className="text-muted">Supporting Document</span>
                          <span className="font-medium text-emerald-700">{supportingState.doc.originalName}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="py-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Quotation</h3>
                    <p className="mt-2 text-sm text-ink">
                      Distance-based quote declared by the owner via{" "}
                      <a
                        href={site.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand underline underline-offset-2"
                      >
                        WhatsApp
                      </a>{" "}
                      after confirmation. No payment is required now.
                    </p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* STEP 5: SUBMIT RESERVATION */}
            {activeStep === 4 && (
              <motion.section
                key="stage-4"
                initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: direction * -16 }}
                transition={{ duration: 0.22, ease }}
              >
                <h2 className="text-xl font-semibold text-ink">You&apos;re almost ready!</h2>
                <p className="mt-1 text-sm text-muted">
                  Accept the terms below and submit your reservation request.
                </p>

                <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">Vehicle</dt>
                    <dd className="font-semibold text-ink">{vehicle.year} {vehicleName(vehicle)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">Route</dt>
                    <dd className="text-right font-medium text-ink">{pickup} → {dropoff}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">Schedule</dt>
                    <dd className="font-medium text-ink">{start} · {startTime}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">Renter</dt>
                    <dd className="font-medium text-ink">{fullName} · {mobile}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">Initial status</dt>
                    <dd className="font-semibold text-brand">Pending Admin Confirmation</dd>
                  </div>
                </dl>

                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-mist/30 p-4 text-xs text-ink">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => {
                      setAgreedTerms(e.target.checked);
                      clearError("agreedTerms");
                    }}
                    className="mt-0.5 h-4 w-4 accent-[#E31824]"
                  />
                  <span>
                    I agree to the CarTaxi PH rental terms and conditions, understand this booking is{" "}
                    <strong>with driver only</strong>, and requires administrator confirmation before payment.
                  </span>
                </label>
                {errors.agreedTerms && <p className="mt-2 text-xs font-medium text-brand">{errors.agreedTerms}</p>}
                {submitError && (
                  <p role="alert" className="mt-4 rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 text-xs font-medium text-brand">
                    {submitError}
                  </p>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            {activeStep > 0 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-ink active:scale-[0.98]"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {activeStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={checkingAvailability || frontState.uploading || backState.uploading || supportingState.uploading}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-60"
              >
                {checkingAvailability ? "Checking..." : "Continue"}
                <ArrowRightIcon width={15} height={15} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Reservation"}
                <ArrowRightIcon width={15} height={15} />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Compact Booking Summary */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-xs">
            <div className="relative aspect-[16/10] bg-mist">
              <Image
                src={vehicle.images[0].src}
                alt={vehicle.images[0].alt}
                fill
                loading="eager"
                sizes="35vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{vehicle.category}</p>
              <h3 className="mt-0.5 text-lg font-semibold text-ink">{vehicleName(vehicle)}</h3>
              <div className="mt-2 flex gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <UsersIcon width={14} height={14} /> {vehicle.passengers} seats
                </span>
                <span className="flex items-center gap-1.5">
                  <GearIcon width={14} height={14} /> {vehicle.transmission}
                </span>
              </div>

              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Route</dt>
                  <dd className="truncate font-medium text-ink">{pickup || "—"} → {dropoff || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Schedule</dt>
                  <dd className="font-medium text-ink">{start ? `${start} · ${startTime}` : "—"}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-line pt-3">
                  <dt className="font-semibold text-ink">Quote</dt>
                  <dd className="font-semibold text-brand">Via WhatsApp</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-4 text-muted">
                With driver only. Distance-based quote declared by the owner.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
