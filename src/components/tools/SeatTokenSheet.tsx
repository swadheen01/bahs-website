"use client";
import { forwardRef, type CSSProperties } from "react";
import { toBanglaDigits, type SeatStudent } from "@/lib/seatToken";

/**
 * Printable seat-plan token pages. Sizes are in CSS px at 96dpi, so one page is exactly A4
 * (794 × 1123 px). All token sizes are in `em`, so the same design scales for 4 or 6 per page.
 */

export type SeatLayout = 4 | 6;

export const LAYOUTS: Record<
  SeatLayout,
  { landscape: boolean; width: number; height: number; cols: number; rows: number; padding: number; gap: number; fontSize: number }
> = {
  // A4 landscape, 2 × 2 big tokens
  4: { landscape: true, width: 1123, height: 794, cols: 2, rows: 2, padding: 32, gap: 28, fontSize: 11.5 },
  // A4 portrait, 2 × 3 tokens
  6: { landscape: false, width: 794, height: 1123, cols: 2, rows: 3, padding: 28, gap: 22, fontSize: 10 },
};

const NAVY = "#0b1f4b";
const GREEN = "#06874A";

export interface TokenOptions {
  schoolName: string;
  examTitle: string;
  banglaDigits: boolean;
}

function SeatToken({ student, options }: { student: SeatStudent; options: TokenOptions }) {
  const fmt = (v: string) => (options.banglaDigits ? toBanglaDigits(v) : v);
  const rows: { label: string; value: string; big?: boolean }[] = [
    { label: "শিক্ষার্থীর নাম", value: student.name },
    { label: "শ্রেণী", value: fmt(student.className) },
    { label: "শাখা", value: fmt(student.section) },
    { label: "রোল", value: fmt(student.roll), big: true },
    { label: "পরীক্ষার হল", value: fmt(student.hall) },
  ];

  const valueBox: CSSProperties = {
    flex: 1,
    minWidth: 0,
    minHeight: "2.15em",
    border: `0.13em solid ${NAVY}`,
    borderRadius: "0.45em",
    padding: "0.2em 0.7em",
    display: "flex",
    alignItems: "center",
    color: "#111827",
    fontWeight: 700,
    lineHeight: 1.15,
    background: "#ffffff",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: `0.28em solid ${NAVY}`,
        padding: "0.3em",
        background: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          height: "100%",
          border: `0.12em solid ${GREEN}`,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ background: NAVY, borderTop: `0.45em solid ${GREEN}`, position: "relative", padding: "0.65em 0.8em 1.55em" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6em" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/logo.png"
              alt=""
              style={{ width: "2.9em", height: "2.9em", borderRadius: "50%", background: "#ffffff", padding: "0.12em", objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{ color: "#ffffff", fontWeight: 800, fontSize: "2.05em", lineHeight: 1.1, textAlign: "center" }}>{options.schoolName}</div>
          </div>
        </div>
        {/* Badge overlapping the header */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "-1.15em", position: "relative" }}>
          <div
            style={{
              background: GREEN,
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1.45em",
              padding: "0.15em 1.1em 0.25em",
              borderRadius: "999px",
              border: "0.12em solid #ffffff",
              boxShadow: "0 0.08em 0.25em rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            আসন বিন্যাস টোকেন
          </div>
        </div>
        {options.examTitle && (
          <div style={{ textAlign: "center", color: GREEN, fontWeight: 700, fontSize: "1.2em", marginTop: "0.25em", lineHeight: 1.15 }}>
            {options.examTitle}
          </div>
        )}

        {/* Fields */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: "0.4em 1.2em 0.6em", gap: "0.35em" }}>
          {rows.map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "0.6em" }}>
              <div style={{ width: "36%", flexShrink: 0, color: NAVY, fontWeight: 800, fontSize: "1.5em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                {row.label}:
              </div>
              {/* Box size/border stay constant; only the text inside shrinks or grows. */}
              <div style={{ ...valueBox, fontSize: "1.6em" }}>
                <span style={{ fontSize: row.big ? "1.2em" : row.value.length > 24 ? "0.78em" : "1em" }}>{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** One A4 page of tokens. The forwarded ref is the node captured into the PDF. */
export const SeatTokenPage = forwardRef<HTMLDivElement, { students: SeatStudent[]; layout: SeatLayout; options: TokenOptions }>(
  function SeatTokenPage({ students, layout, options }, ref) {
    const L = LAYOUTS[layout];
    return (
      <div
        ref={ref}
        className="font-bengali"
        style={{
          width: L.width,
          height: L.height,
          padding: L.padding,
          boxSizing: "border-box",
          background: "#ffffff",
          display: "grid",
          gridTemplateColumns: `repeat(${L.cols}, 1fr)`,
          gridTemplateRows: `repeat(${L.rows}, 1fr)`,
          gap: L.gap,
          fontSize: L.fontSize,
        }}
      >
        {students.map((s, i) => (
          // Dashed outline in the middle of the gap = cutting guide.
          <div key={i} style={{ minWidth: 0, minHeight: 0, outline: "1px dashed #b6c2d2", outlineOffset: L.gap / 2 - 1 }}>
            <SeatToken student={s} options={options} />
          </div>
        ))}
      </div>
    );
  }
);
