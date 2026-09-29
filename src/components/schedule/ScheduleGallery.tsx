"use client";

import { useState } from "react";
import Image from "next/image";
import type { ScheduleDay } from "@/types";
import Modal from "@/components/ui/Modal";

export default function ScheduleGallery({ days }: { days: ScheduleDay[] }) {
  const [open, setOpen] = useState<ScheduleDay | null>(null);

  if (!days.length) return <p className="text-center text-paper/60">Schedule will be announced soon.</p>;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {days.map((d) => (
          <button key={d.day} onClick={() => setOpen(d)} className="rounded-lg bg-paper p-3 text-ink">
            <h2 className="mb-2 font-display text-3xl">{d.day}</h2>
            <div className="relative aspect-[3/4]">
              <Image src={d.image} alt={`${d.day} agenda`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
            </div>
          </button>
        ))}
      </div>
      <Modal open={open !== null} onClose={() => setOpen(null)} title={open?.day}>
        {open && (
          <Image src={open.image} alt={`${open.day} agenda`} width={1200} height={1600} className="h-auto w-full" />
        )}
      </Modal>
    </>
  );
}
