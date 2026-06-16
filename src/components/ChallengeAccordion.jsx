import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function ExpandedContent({ challenge }) {
  const isRich = Boolean(challenge.quote)

  if (!isRich) {
    return (
      <p className="text-sm leading-relaxed text-zinc-400 md:text-base">
        {challenge.desc}
      </p>
    )
  }

  return (
    <>
      <blockquote className="rounded-r-lg border-l-2 border-[var(--neon-purple)]/40 bg-[var(--neon-purple)]/[0.05] py-3 pl-4">
        <p className="text-sm italic leading-relaxed text-zinc-400 md:text-base">
          &ldquo;{challenge.quote}&rdquo;
        </p>
        <footer className="mt-2 text-xs text-zinc-500">
          — {challenge.attribution}
        </footer>
      </blockquote>
      <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
        {challenge.body}
      </p>
      <div className="mt-5 flex items-end gap-3 border-t border-white/[0.06] pt-4">
        <p className="neon-stat text-3xl leading-none md:text-4xl [text-shadow:0_0_14px_rgba(138,92,255,0.5),0_0_28px_rgba(255,92,122,0.25)]">
          {challenge.stat}
        </p>
        <p className="pb-1 text-xs leading-snug text-zinc-500">
          {challenge.statLabel}
        </p>
      </div>
    </>
  )
}

export default function ChallengeAccordion({ challenges }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  const close = () => setOpenIndex(null)
  const openChallenge = openIndex !== null ? challenges[openIndex] : null

  useEffect(() => {
    if (openIndex === null) return undefined

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openIndex])

  const modal = openChallenge
    ? createPortal(
        <div className="challenge-accordion-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="challenge-accordion-backdrop absolute inset-0"
            aria-label="Close expanded card"
            onClick={close}
          />

          <div
            className="challenge-accordion-modal challenge-card relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#16121c]/95 text-left shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(138,92,255,0.12),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:max-w-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="challenge-modal-title"
          >
            <div className="relative border-b border-white/[0.06] px-4 py-4 sm:px-5 sm:py-5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(138,92,255,0.1),transparent_55%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="veil-eyebrow text-[9px] font-semibold uppercase sm:text-[10px]">
                    {openChallenge.tag}
                  </p>
                  <h3
                    id="challenge-modal-title"
                    className="mt-2 font-[Orbitron] text-base font-bold leading-snug text-slate-100 sm:text-lg"
                  >
                    {openChallenge.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="challenge-accordion-icon challenge-accordion-icon--open shrink-0"
                  aria-label="Close"
                >
                  +
                </button>
              </div>
            </div>

            <div className="max-h-[min(24rem,55vh)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <ExpandedContent challenge={openChallenge} />
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <div className={`challenge-accordion relative grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 ${openIndex !== null ? 'challenge-accordion--active' : ''}`}>
      {modal}

      {challenges.map((challenge, index) => {
        const isOpen = openIndex === index

        return (
          <div
            key={challenge.tag}
            className={`challenge-card challenge-accordion-item rounded-xl text-left transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${isOpen ? 'challenge-accordion-item--open' : ''}`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="challenge-accordion-trigger flex w-full items-center justify-between gap-3 px-3 py-3 text-left md:px-4 md:py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="veil-eyebrow text-[9px] font-semibold uppercase md:text-[10px]">
                  {challenge.tag}
                </p>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-slate-200 md:text-base">
                  {challenge.title}
                </h3>
              </div>

              <span
                className={`challenge-accordion-icon shrink-0 ${isOpen ? 'challenge-accordion-icon--open' : ''}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
